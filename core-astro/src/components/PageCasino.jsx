import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { socket } from '../socket';
import PagePoker from './PagePoker';
import NeonIcon from './NeonIcon';

const BG_ASSET_VERSION = '20260317a';
const CASINO_VIEW_THEME = {
  poker: {
    glow: '#00FFFF',
    glowSoft: 'rgba(0, 255, 255, 0.32)',
    bg: `linear-gradient(145deg, rgba(255,0,255,0.24), rgba(0,30,30,0.92)), url('/images/backgrounds/bg_casino_retrowave_v3.png?v=${BG_ASSET_VERSION}')`,
  },
  polymario: {
    glow: '#E0FFFF',
    glowSoft: 'rgba(0, 255, 255, 0.30)',
    bg: `linear-gradient(145deg, rgba(224,255,255,0.16), rgba(0,20,18,0.95)), url('/images/backgrounds/bg_motskartes_matrix_v3.png?v=${BG_ASSET_VERSION}')`,
  },
};

export default function PageCasino() {
  const { bets, username, spendCoins, setBgOverride, clearBgOverride } = useStore();
  const [selectedAmounts, setSelectedAmounts] = useState({});
  const [newBetQuestion, setNewBetQuestion] = useState('');
  const [newBetOptions, setNewBetOptions] = useState(['', '']);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [casinoTab, setCasinoTab] = useState('poker');
  const viewTheme = CASINO_VIEW_THEME[casinoTab] || CASINO_VIEW_THEME.poker;

  useEffect(() => {
    setBgOverride(viewTheme);
  }, [viewTheme]);

  useEffect(() => {
    return () => clearBgOverride();
  }, []);

  const handlePlaceBet = (betId, optionIdx, betTitle) => {
    const amountStr = selectedAmounts[`${betId}-${optionIdx}`];
    const amount = parseInt(amountStr, 10);

    if (!amount || amount <= 0) {
      alert("Il faut miser une somme valide (plus de 0 pièces) !");
      return;
    }

    if (window.confirm(`Miser ${amount} pièces sur "${betTitle}" ?`)) {
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

  const setPage = useStore(s => s.setPage);

  const CategoryTabBar = () => (
    <div className="category-tab-bar">
      <button className="category-tab" onClick={() => setPage('LUIGI')}>
        <NeonIcon name="Luidgi icône" size={18} /> ARCADE
      </button>
      <button className="category-tab active" onClick={() => setPage('CASINO')}>
        <NeonIcon name="casino-global-icon" size={18} /> CASINO
      </button>
    </div>
  );

  return (
    <motion.div
      className="page-casino"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <CategoryTabBar />
      <div className="casino-tab-bar">
        <button className={`casino-tab-btn ${casinoTab === 'poker' ? 'active' : ''}`} onClick={() => setCasinoTab('poker')}>
          <NeonIcon name="poker-tab-neon" size={24} glow={casinoTab === 'poker' ? "#00ffff" : undefined} className="casino-tab-img" /> POKER
        </button>
        <button className={`casino-tab-btn ${casinoTab === 'polymario' ? 'active' : ''}`} onClick={() => setCasinoTab('polymario')}>
          <NeonIcon name="polymario-tab-neon" size={24} glow={casinoTab === 'polymario' ? "#ff00ff" : undefined} className="casino-tab-img" /> POLYMARIO
        </button>
      </div>
      {casinoTab === 'poker' ? (
        <PagePoker />
      ) : (
      <>
      <div className="casino-header">
        <h1 className="casino-title">
          <NeonIcon name="polymario-tab-neon" size={32} glow="#ff00ff" style={{ marginRight: 10 }} />
          POLYMARIO
        </h1>
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
                    {bet.status === 'OPEN' ? <><NeonIcon name="fire-flower-pixel" size={16} /> EN COURS</> : <><NeonIcon name="question-block-crossword" size={16} /> RÉSULTAT TOMBÉ</>}
                  </div>
                  
                  <h3 className="bet-question">{bet.question}</h3>
                  <div className="bet-pot-info">
                    Cagnotte Globale: <span>{totalPot.toLocaleString()} <NeonIcon name="coin-gold" size={18} /></span>
                  </div>

                  <div className="bet-options">
                    {bet.options.map((opt, idx) => {
                      const optionBets = bet.betsPlaced.filter(b => b.optionIdx === idx);
                      const optionTotal = optionBets.reduce((acc, b) => acc + b.amount, 0);
                      const percentage = totalPot > 0 ? ((optionTotal / totalPot) * 100).toFixed(0) : 0;
                      const isWinner = bet.winningOption === idx;
                      
                      // CALCUL DE LA CÔTE (AVEC BONUS CASINO 1.2x)
                      const odd = optionTotal === 0 ? "10.00" : (totalPot * 1.2 / optionTotal).toFixed(2);
                      const myInput = selectedAmounts[`${bet.id}-${idx}`] || 0;
                      const potentialGain = Math.floor(myInput * odd);

                      return (
                        <div key={idx} className={`bet-option ${isWinner ? 'winner' : ''}`}>
                          <div className="option-header">
                            <span className="option-name">{opt}</span>
                            <div className="option-badges">
                                <span className="option-odd">x{odd}</span>
                                <span className="option-percentage">{percentage}%</span>
                            </div>
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
                            {optionTotal.toLocaleString()} <NeonIcon name="coin-gold" size={14} /> misés
                          </div>

                          {bet.status === 'OPEN' && (
                            <div className="place-bet-area">
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
                              {myInput > 0 && (
                                <div className="potential-gain">
                                  Gain estimé : <span>{potentialGain.toLocaleString()} <NeonIcon name="coin-gold" size={12} /></span>
                                </div>
                              )}
                            </div>
                          )}

                          {bet.status === 'RESOLVED' && isWinner && (
                            <div className="winner-badge"><NeonIcon name="treasure-chest" size={18} /> RÉPONSE GAGNANTE</div>
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
      </>
      )}

      <style>{`
        .page-casino {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 0 0 40px 0;
        }

        .casino-tab-bar {
          display: flex;
          width: 100%;
          max-width: 240px; /* Réduit à 240px */
          gap: 4px;
          margin: -20px auto 5px auto; /* Augmenté de -28px à -20px pour plus d'espace */
          padding: 0 5px;
          justify-content: center;
        }
        .casino-tab-btn {
          flex: 1;
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 4px;
          padding: 3px 1px;
          color: #666;
          font-weight: 700;
          font-size: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .casino-tab-btn.active {
          background: rgba(255, 0, 255, 0.15) !important;
          border-color: #ff00ff !important;
          color: white;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.3) !important;
        }

        .casino-tab-btn.active .casino-tab-img {
          animation: neon-pulse 2s infinite ease-in-out;
        }

        @keyframes neon-pulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.1); filter: brightness(1.2); }
        }

        .category-tab-bar {
          display: flex;
          width: 100%;
          max-width: 450px;
          gap: 10px;
          margin-bottom: 2px;
          padding: 0 5px;
          z-index: 100;
        }
        .category-tab {
          flex: 1;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 15px;
          padding: 12px;
          color: #aaa;
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .category-tab.active {
          background: rgba(57, 255, 20, 0.2) !important;
          border-color: #39ff14 !important;
          color: white;
          box-shadow: 0 0 15px rgba(57, 255, 20, 0.3);
        }

        .casino-header {
          text-align: center;
          padding: 20px;
          background: transparent;
          border: none;
          border-radius: 0;
        }

        .casino-title {
          font-size: 2.5rem;
          font-weight: 900;
          color: #ff00ff;
          margin: 0;
          text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-create-toggle {
            margin-top: 15px;
            background: transparent !important;
            border: none !important;
            color: #ff00ff;
            border-radius: 0;
            padding: 8px 15px;
            font-weight: bold;
            cursor: pointer;
            text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
        }

        .create-bet-form {
            background: transparent !important;
            border: none !important;
            padding: 20px;
            border-radius: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
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
          background: transparent !important;
          border-radius: 0;
        }

        .bets-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .bet-card {
          background: transparent !important;
          border: none !important;
          border-radius: 0;
          padding: 15px;
          position: relative;
          overflow: hidden;
          box-shadow: none !important;
          border-bottom: 1px solid rgba(255, 0, 255, 0.2) !important;
        }

        .bet-card.resolved {
          border-bottom-color: transparent !important;
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
          display: flex;
          align-items: center;
          gap: 4px;
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

        .container-casino {
            padding: 20px;
            color: white;
            padding-bottom: 120px;
        }
        
        /* FIX iOS ZOOM BUG */
        .page-casino input,
        .page-casino textarea,
        .page-casino select {
            font-size: 16px !important;
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
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .bet-options {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .bet-option {
          background: transparent !important;
          padding: 12px;
          border-radius: 0;
          border: none !important;
          border-left: 2px solid rgba(255, 255, 255, 0.2) !important;
        }

        .bet-option.winner {
          background: transparent !important;
          border-left-color: #39ff14 !important;
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
          display: flex;
          align-items: center;
          gap: 4px;
        }

         .place-bet-area {
           display: flex;
           flex-direction: column;
           gap: 6px;
           margin-top: 10px;
         }

         .place-bet-controls {
           display: flex;
           gap: 10px;
         }

         .place-bet-controls input {
           flex: 1;
           padding: 8px;
           border-radius: 8px;
           border: 1px solid rgba(255, 255, 255, 0.1);
           background: rgba(0,0,0,0.3);
           color: white;
           font-weight: bold;
           text-align: center;
           outline: none;
         }

         .place-bet-controls button {
           flex: 1;
           background: #ff00ff !important;
           color: white !important;
           border: none !important;
           border-radius: 8px !important;
           font-weight: 900 !important;
           cursor: pointer;
           text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);
           box-shadow: 0 0 15px rgba(255, 0, 255, 0.4);
         }

         .place-bet-controls button:active {
           transform: scale(0.95);
         }

         .option-badges {
           display: flex;
           gap: 10px;
           align-items: center;
         }

         .option-odd {
           background: rgba(0, 255, 204, 0.15);
           color: #00ffcc;
           padding: 2px 8px;
           border-radius: 6px;
           font-size: 0.8rem;
           border: 1px solid rgba(0, 255, 204, 0.3);
           font-weight: 900;
         }

         .potential-gain {
           font-size: 0.75rem;
           color: #aaa;
           text-align: right;
           margin-right: 5px;
         }
         
         .potential-gain span {
           color: #00ffcc;
           font-weight: 800;
         }

        .winner-badge {
          text-align: center;
          color: #39ff14;
          font-weight: 900;
          font-size: 1rem;
          margin-top: 10px;
          animation: pulse 1s infinite alternate;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        @keyframes pulse {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </motion.div>
  );
}
