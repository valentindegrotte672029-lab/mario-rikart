import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { socket } from '../socket';

// --- CARD COMPONENT ---
const PokerCard = ({ card }) => {
  if (!card) return null;
  if (card === 'hidden') return <div className="poker-card card-hidden"></div>;
  
  const rank = card[0] === 'T' ? '10' : card[0];
  const suitStr = card[1];
  let suit = '♠';
  let color = 'black';
  if (suitStr === 'h') { suit = '♥'; color = '#ff3333'; }
  if (suitStr === 'd') { suit = '♦'; color = '#ff3333'; }
  if (suitStr === 'c') { suit = '♣'; color = 'black'; }

  return (
    <motion.div 
        className="poker-card" 
        style={{ color }}
        initial={{ rotateY: 180, scale: 0.8 }}
        animate={{ rotateY: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
    >
      <div className="card-top">{rank}<br/>{suit}</div>
      <div className="card-center">{suit}</div>
      <div className="card-bottom">{rank}<br/>{suit}</div>
    </motion.div>
  );
};

export default function PagePoker() {
  const { pokerState, username } = useStore();
  const [raiseAmount, setRaiseAmount] = useState(0);

  // Sync state actions
  useEffect(() => {
     if (pokerState && pokerState.minRaise) {
         setRaiseAmount(pokerState.minRaise);
     }
  }, [pokerState?.minRaise]);

  const handleJoin = () => {
    socket.emit('poker_join', username);
  };

  const handleStartBots = () => {
    socket.emit('poker_start_bots');
  };

  const handleAction = (action) => {
    socket.emit('poker_action', { action, amount: raiseAmount });
  };

  // Extract me and opponents
  const myPlayer = pokerState?.players?.find(p => p.username === username);
  const opponents = pokerState?.players?.filter(p => p.username !== username) || [];

  const isMyTurn = pokerState?.players?.[pokerState?.currentTurnIdx]?.username === username;
  const toCall = isMyTurn ? (pokerState.highestBet - (myPlayer?.currentBet || 0)) : 0;

  return (
    <motion.div
      className="page-poker"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {!pokerState || pokerState.status === 'WAITING' ? (
        <div className="poker-lobby">
           <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Poker_Game.svg/1200px-Poker_Game.svg.png" style={{width: 150, opacity: 0.5, marginBottom: 20, filter: 'invert(1)'}}/>
           <h1>SALOON EXPRESSO</h1>
           <p>Mise de départ : <b>100 🟡</b></p>
           
           {!myPlayer ? (
             <button className="btn-join" onClick={handleJoin}>M'asseoir à la table</button>
           ) : (
             <div className="lobby-waiting">
                <p>En attente d'autres joueurs... ({pokerState.players.length}/3)</p>
                <div className="lobby-players">
                   {pokerState.players.map(p => <span key={p.id}>{p.username} </span>)}
                </div>
                <button className="btn-bots" onClick={handleStartBots}>Lancer avec des IA</button>
             </div>
           )}
        </div>
      ) : pokerState.status === 'SPINNING' ? (
        <div className="poker-spinner">
           <h2>LE JACKPOT EST DE...</h2>
           <motion.div 
             className="jackpot-amount"
             initial={{ scale: 0 }}
             animate={{ scale: [1, 1.5, 1], rotate: [0, 10, -10, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
           >
              {pokerState.prizePool} 🟡
           </motion.div>
           <p>(Subvention x{pokerState.multiplier})</p>
        </div>
      ) : (
        <div className="poker-table-container">
            {/* Table Tapis Vert */}
            <div className="tapis-vert">
                <div className="inner-table">
                   {/* Opponents */}
                   {opponents.map((opp, idx) => (
                      <div key={opp.id} className={`seat opponent opponent-${idx} ${pokerState.currentTurnIdx === pokerState.players.findIndex(p => p.username === opp.username) ? 'active-turn' : ''} ${opp.folded ? 'folded' : ''}`}>
                          <div className="player-info">
                              <span className="player-name">{opp.username} {opp.isBot ? '🤖' : ''}</span>
                              <span className="player-chips">{opp.chips} 🟡</span>
                          </div>
                          <div className="player-cards">
                              {opp.cards.map((c, i) => <PokerCard key={i} card={c} />)}
                          </div>
                          {opp.currentBet > 0 && <div className="player-bet">{opp.currentBet} 🟡</div>}
                      </div>
                   ))}

                   {/* Center / Community */}
                   <div className="table-center">
                       <div className="pot-display">
                           POT: {pokerState.pot} 🟡<br/>
                           <span style={{fontSize: '0.7rem', color: '#ffcc00'}}>À GAGNER: {pokerState.prizePool} 🟡</span>
                       </div>
                       <div className="community-cards">
                           {pokerState.communityCards.map((c, i) => <PokerCard key={i} card={c} />)}
                       </div>
                       {pokerState.lastAction && (
                           <div className="last-action-log">{pokerState.lastAction}</div>
                       )}
                   </div>

                   {/* My Player */}
                   {myPlayer && (
                      <div className={`seat my-seat ${isMyTurn ? 'active-turn' : ''} ${myPlayer.folded ? 'folded' : ''}`}>
                          {myPlayer.currentBet > 0 && <div className="my-bet">{myPlayer.currentBet} 🟡</div>}
                          <div className="player-cards my-cards">
                              {myPlayer.cards.map((c, i) => <PokerCard key={i} card={c} />)}
                          </div>
                          <div className="player-info local-info">
                              <span className="player-name">{myPlayer.username}</span>
                              <span className="player-chips">{myPlayer.chips} 🟡</span>
                          </div>
                      </div>
                   )}
                </div>
            </div>

            {/* Controls */}
            <AnimatePresence>
                {isMyTurn && !myPlayer?.folded && (
                    <motion.div 
                        className="poker-controls"
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                    >
                        <div className="raise-slider-area">
                           <input 
                              type="range" 
                              min={pokerState.minRaise} 
                              max={myPlayer.chips} 
                              value={raiseAmount} 
                              onChange={(e) => setRaiseAmount(Number(e.target.value))}
                              disabled={myPlayer.chips <= pokerState.minRaise}
                           />
                           <span>Relance : {raiseAmount} 🟡</span>
                        </div>
                        <div className="action-buttons">
                           <button className="btn-fold" onClick={() => handleAction('fold')}>Coucher</button>
                           <button className="btn-call" onClick={() => handleAction('call')}>
                               {toCall === 0 ? 'Parole' : `Suivre (${toCall})`}
                           </button>
                           <button 
                             className="btn-raise" 
                             onClick={() => handleAction('raise')}
                             disabled={myPlayer.chips <= toCall}
                           >
                               Relancer
                           </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      )}

      <style>{`
        .page-poker {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* LOBBY */
        .poker-lobby {
          text-align: center;
          background: rgba(0,0,0,0.8);
          padding: 40px;
          border-radius: 20px;
          border: 2px solid #00ff66;
          box-shadow: 0 0 50px rgba(0, 255, 102, 0.2);
        }
        .poker-lobby h1 { color: #00ff66; margin-bottom: 5px; font-weight: 900; }
        .poker-lobby p { color: #aaa; margin-bottom: 25px; }

        .btn-join { background: #00ff66; color: black; font-weight: bold; font-size: 1.2rem; padding: 15px 30px; border: none; border-radius: 10px; cursor: pointer; }
        .btn-join:active { transform: scale(0.95); }

        .btn-bots { background: #ffcc00; color: black; font-weight: bold; padding: 10px 20px; border: none; border-radius: 8px; margin-top: 20px; cursor: pointer; }

        .lobby-waiting { color: white; }
        .lobby-players { margin-top: 10px; font-weight: bold; color: #00ffcc; }

        /* SPINNER (Twister) */
        .poker-spinner {
          text-align: center;
          color: white;
        }
        .jackpot-amount {
          font-size: 5rem;
          font-weight: 900;
          color: #ffcc00;
          text-shadow: 0 0 20px #ffcc00;
          margin: 20px 0;
        }

        /* TABLE */
        .poker-table-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .tapis-vert {
          flex: 1;
          margin: 10px;
          background: radial-gradient(circle at center, #0a5a2a, #032a10);
          border-radius: 100px;
          border: 10px solid #222;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.8), 0 15px 30px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .inner-table {
          width: 100%;
          height: 100%;
          position: relative;
        }

        /* SEATS */
        .seat {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: opacity 0.3s;
        }
        .seat.folded { opacity: 0.4; }
        
        .active-turn .player-info {
          border-color: #00ff66;
          box-shadow: 0 0 15px #00ff66;
          animation: pulseTurn 1s infinite alternate;
        }

        @keyframes pulseTurn {
           0% { box-shadow: 0 0 5px #00ff66; }
           100% { box-shadow: 0 0 20px #00ff66; }
        }

        .opponent-0 { top: 5%; left: 10%; }
        .opponent-1 { top: 5%; right: 10%; }
        /* Add more if max players > 3 */

        .my-seat { bottom: 10%; left: 50%; transform: translateX(-50%); }

        .player-info {
           background: rgba(0,0,0,0.7);
           border: 2px solid #555;
           border-radius: 10px;
           padding: 5px 15px;
           text-align: center;
           color: white;
           z-index: 2;
        }
        .player-name { font-size: 0.8rem; font-weight: bold; display: block; }
        .player-chips { font-size: 0.9rem; color: #ffcc00; font-weight: bold; }

        .player-bet {
           background: rgba(0, 0, 0, 0.5);
           color: #00ffcc;
           padding: 2px 8px;
           border-radius: 10px;
           font-size: 0.8rem;
           margin-top: 5px;
           font-weight: bold;
           border: 1px solid #00ffcc;
        }

        .my-bet {
           position: absolute;
           top: -30px;
           background: rgba(0, 0, 0, 0.5);
           color: #00ffcc;
           padding: 2px 8px;
           border-radius: 10px;
           font-size: 0.8rem;
           font-weight: bold;
           border: 1px solid #00ffcc;
        }

        .player-cards {
           display: flex;
           gap: -15px;
           margin-top: -10px;
        }
        .my-cards {
           gap: -5px;
           margin-top: -20px;
           margin-bottom: -15px;
           z-index: 1;
           transform: scale(1.3);
        }

        /* CENTER AREA */
        .table-center {
           position: absolute;
           top: 50%; left: 50%;
           transform: translate(-50%, -50%);
           display: flex;
           flex-direction: column;
           align-items: center;
        }

        .pot-display {
           background: rgba(0,0,0,0.6);
           padding: 5px 15px;
           border-radius: 15px;
           color: white;
           font-weight: 900;
           font-size: 1.2rem;
           margin-bottom: 10px;
           border: 1px solid #ffcc00;
           text-align: center;
        }

        .community-cards {
           display: flex;
           gap: 5px;
        }

        .last-action-log {
           margin-top: 15px;
           background: rgba(255,255,255,0.1);
           color: white;
           padding: 5px 15px;
           border-radius: 10px;
           font-size: 0.8rem;
           font-style: italic;
           max-width: 250px;
           text-align: center;
        }

        /* CARDS CSS */
        .poker-card {
           width: 45px;
           height: 65px;
           background: white;
           border-radius: 5px;
           box-shadow: 1px 1px 5px rgba(0,0,0,0.5);
           display: flex;
           flex-direction: column;
           justify-content: space-between;
           padding: 2px 4px;
           font-family: 'Courier New', monospace;
           font-weight: 900;
           font-size: 0.9rem;
           position: relative;
           user-select: none;
        }
        .poker-card:not(:first-child) {
           margin-left: -15px;
        }

        .community-cards .poker-card {
           width: 50px; height: 70px; margin-left: 0; font-size: 1rem;
        }

        .card-hidden {
           background: repeating-linear-gradient(45deg, #cc0000, #cc0000 5px, #ff3333 5px, #ff3333 10px);
           border: 2px solid white;
        }

        .card-top { text-align: left; line-height: 0.9; }
        .card-bottom { text-align: right; line-height: 0.9; transform: rotate(180deg); }
        .card-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.5rem; opacity: 0.2; }

        /* CONTROLS AREA */
        .poker-controls {
           background: #111;
           padding: 15px 15px 25px 15px;
           border-top-left-radius: 20px;
           border-top-right-radius: 20px;
           border-top: 2px solid #333;
           display: flex;
           flex-direction: column;
           gap: 15px;
        }

        .raise-slider-area {
           display: flex;
           align-items: center;
           gap: 15px;
           color: white;
           font-weight: bold;
           font-size: 0.9rem;
        }
        .raise-slider-area input { flex: 1; }

        .action-buttons {
           display: flex;
           gap: 10px;
        }
        .action-buttons button {
           flex: 1;
           padding: 15px 0;
           border: none;
           border-radius: 10px;
           font-weight: 900;
           font-size: 1.1rem;
           text-transform: uppercase;
           cursor: pointer;
        }
        .action-buttons button:active:not(:disabled) { transform: translateY(2px); }
        .action-buttons button:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-fold { background: #333; color: white; }
        .btn-call { background: #00ffcc; color: black; }
        .btn-raise { background: #ff00ff; color: white; }

      `}</style>
    </motion.div>
  );
}
