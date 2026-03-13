import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { socket } from '../socket';

export default function PageCasino() {
  const { bets, username, spendCoins } = useStore();
  const [selectedAmounts, setSelectedAmounts] = useState({});
  const [newBetQuestion, setNewBetQuestion] = useState('');
  const [newBetOptions, setNewBetOptions] = useState(['', '']);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handlePlaceBet = (betId, optionIdx, betTitle) => {
    const amountStr = selectedAmounts[`${betId}-${optionIdx}`];
    const amount = parseInt(amountStr, 10);

    if (!amount || amount <= 0) {
      alert("Il faut miser une somme valide (plus de 0 🟡) !");
      return;
    }

    if (window.confirm(`Miser ${amount} 🟡 sur "${betTitle}" ?`)) {
      const success = spendCoins(amount, "PARI POLYMARKET");
      if (success) {
        socket.emit('place_bet', { betId, optionIdx, amount, username });
        setSelectedAmounts(prev => ({ ...prev, [`${betId}-${optionIdx}`]: '' }));
      }
    }
  };

  const handleCreateBet = () => {
    if (!newBetQuestion.trim()) return alert("Posez une question !");
    const validOptions = newBetOptions.filter(o => o.trim() !== '');
    if (validOptions.length < 2) return alert("Il faut au moins 2 réponses.");

    socket.emit('create_bet', { question: newBetQuestion, options: validOptions });
    setNewBetQuestion('');
    setNewBetOptions(['', '']);
    setShowCreateForm(false);
    alert('Paris créé avec succès !');
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newBetOptions];
    newOptions[index] = value;
    setNewBetOptions(newOptions);
  };

  return (
    <motion.div
      className="page-casino"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="casino-header">
        <h1 className="casino-title">🎰 CASINO </h1>
        <p className="casino-subtitle">Dévoilez vos pronostics.</p>
        <button className="btn-create-toggle" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Fermer' : 'Créer un Pari / Sondage'}
        </button>
      </div>

      <AnimatePresence>
          {showCreateForm && (
            <motion.div 
              className="create-bet-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
                <h3>Nouveau Sondage</h3>
                <input 
                  type="text" 
                  placeholder="Posez votre question (Ex: Qui va gagner ?)" 
                  value={newBetQuestion}
                  onChange={e => setNewBetQuestion(e.target.value)}
                />
                {newBetOptions.map((opt, i) => (
                  <input 
                    key={i}
                    type="text"
                    placeholder={`Option ${i+1}`}
                    value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                  />
                ))}
                <div className="form-actions">
                    <button className="btn-add-opt" onClick={() => setNewBetOptions([...newBetOptions, ''])}>+ Option</button>
                    <button className="btn-submit-bet" onClick={handleCreateBet}>LANCER</button>
                </div>
            </motion.div>
          )}
      </AnimatePresence>

      <div className="bets-container">
        {bets.length === 0 ? (
          <div className="empty-bets">Aucun pari en cours pour l'instant.</div>
        ) : (
          <AnimatePresence>
            {bets.map(bet => {
              const totalPot = bet.betsPlaced.reduce((acc, b) => acc + b.amount, 0);
              
              return (
                <motion.div 
                  key={bet.id} 
                  className={`bet-card ${bet.status === 'RESOLVED' ? 'resolved' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="bet-status">
                    {bet.status === 'OPEN' ? '🔥 EN COURS' : '🔒 RÉSULTAT TOMBÉ'}
                  </div>
                  
                  <h3 className="bet-question">{bet.question}</h3>
                  <div className="bet-pot-info">
                    Cagnotte Globale: <span>{totalPot.toLocaleString()} 🟡</span>
                  </div>

                  <div className="bet-options">
                    {bet.options.map((opt, idx) => {
                      const optionBets = bet.betsPlaced.filter(b => b.optionIdx === idx);
                      const optionTotal = optionBets.reduce((acc, b) => acc + b.amount, 0);
                      const percentage = totalPot > 0 ? ((optionTotal / totalPot) * 100).toFixed(0) : 0;
                      const isWinner = bet.winningOption === idx;

                      return (
                        <div key={idx} className={`bet-option ${isWinner ? 'winner' : ''}`}>
                          <div className="option-header">
                            <span className="option-name">{opt}</span>
                            <span className="option-percentage">{percentage}%</span>
                          </div>
                          
                          <div className="progress-bar-bg">
                            <motion.div 
                              className="progress-bar-fill" 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, type: "spring" }}
                            />
                          </div>
                          
                          <div className="option-details">
                            {optionTotal.toLocaleString()} 🟡 misés
                          </div>

                          {bet.status === 'OPEN' && (
                            <div className="place-bet-controls">
                              <input 
                                type="number" 
                                placeholder="Mise" 
                                value={selectedAmounts[`${bet.id}-${idx}`] || ''}
                                onChange={e => setSelectedAmounts(prev => ({ ...prev, [`${bet.id}-${idx}`]: e.target.value }))}
                                min="1"
                              />
                              <button onClick={() => handlePlaceBet(bet.id, idx, opt)}>PARIER</button>
                            </div>
                          )}

                          {bet.status === 'RESOLVED' && isWinner && (
                            <div className="winner-badge">🏆 RÉPONSE GAGNANTE</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <style>{`
        .page-casino {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 0 0 40px 0;
        }

        .casino-header {
          text-align: center;
          padding: 20px;
          background: rgba(255, 0, 255, 0.1);
          border: 1px solid rgba(255, 0, 255, 0.3);
          border-radius: 15px;
          backdrop-filter: blur(10px);
        }

        .casino-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ff00ff;
          margin: 0;
          text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
        }

        .btn-create-toggle {
            margin-top: 15px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid #ff00ff;
            color: #ff00ff;
            border-radius: 20px;
            padding: 8px 15px;
            font-weight: bold;
            cursor: pointer;
        }

        .create-bet-form {
            background: rgba(0,0,0,0.8);
            border: 2px dashed #00ffcc;
            padding: 20px;
            border-radius: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            overflow: hidden;
        }
        .create-bet-form h3 { color: #00ffcc; margin-bottom: 5px; }
        .create-bet-form input {
            background: #111; border: 1px solid #333; color: white;
            padding: 10px; border-radius: 8px; width: 100%;
        }
        .form-actions { display: flex; gap: 10px; margin-top: 10px; }
        .btn-add-opt { flex: 1; background: #333; border: none; color: white; border-radius: 8px; font-weight: bold; }
        .btn-submit-bet { flex: 2; background: #00ffcc; border: none; color: black; border-radius: 8px; font-weight: bold; padding: 12px; }


        .casino-subtitle {
          color: #fff;
          font-weight: bold;
          margin-top: 5px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .empty-bets {
          text-align: center;
          padding: 40px;
          color: #aaa;
          font-style: italic;
          background: rgba(0,0,0,0.4);
          border-radius: 15px;
        }

        .bets-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .bet-card {
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid #ff00ff;
          border-radius: 15px;
          padding: 15px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 5px 20px rgba(255, 0, 255, 0.2);
        }

        .bet-card.resolved {
          border-color: #555;
          box-shadow: none;
          opacity: 0.8;
        }

        .bet-status {
          position: absolute;
          top: 0;
          right: 0;
          background: #ff00ff;
          color: white;
          padding: 5px 15px;
          font-size: 0.8rem;
          font-weight: bold;
          border-bottom-left-radius: 10px;
        }

        .bet-card.resolved .bet-status {
          background: #555;
        }

        .bet-question {
          font-size: 1.3rem;
          color: white;
          margin-top: 25px;
          margin-bottom: 10px;
          padding-right: 10px;
        }

        .bet-pot-info {
          font-size: 0.9rem;
          color: #aaa;
          margin-bottom: 20px;
        }
        .bet-pot-info span {
          color: #ffcc00;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .bet-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .bet-option {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .bet-option.winner {
          background: rgba(0, 255, 0, 0.1);
          border-color: #39ff14;
        }

        .option-header {
          display: flex;
          justify-content: space-between;
          color: white;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .option-percentage {
          color: #ff00ff;
        }

        .progress-bar-bg {
          width: 100%;
          height: 10px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 5px;
          overflow: hidden;
          margin-bottom: 5px;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff00ff, #00ffcc);
          border-radius: 5px;
        }

        .bet-option.winner .progress-bar-fill {
          background: #39ff14;
        }

        .option-details {
          font-size: 0.8rem;
          color: #888;
          text-align: left;
          margin-bottom: 10px;
        }

        .place-bet-controls {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .place-bet-controls input {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          border: none;
          background: #222;
          color: white;
          font-weight: bold;
          text-align: center;
        }

        .place-bet-controls button {
          flex: 1;
          background: #ff00ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .place-bet-controls button:active {
          transform: scale(0.95);
        }

        .winner-badge {
          text-align: center;
          color: #39ff14;
          font-weight: 900;
          font-size: 1rem;
          margin-top: 10px;
          animation: pulse 1s infinite alternate;
        }

        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </motion.div>
  );
}
