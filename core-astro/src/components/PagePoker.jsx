import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { socket } from '../socket';

// --- SYNTHÉTISEUR AUDIO BROWSER ---
let audioCtx = null;
const initAudio = () => {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch(e) {
        console.warn("AudioContext init failed", e);
    }
};

const playTone = (frequency, duration, type = 'sine', vol = 0.05) => {
  try {
      if (!audioCtx) return;
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
  } catch(e) {}
};

const playChipSound = () => {
   playTone(400, 0.1, 'triangle', 0.1);
   setTimeout(() => playTone(600, 0.15, 'triangle', 0.1), 50);
};

const playCardSound = () => {
   playTone(150, 0.1, 'square', 0.02);
};

const playWinSound = () => {
   playTone(523.25, 0.1, 'sine', 0.1); 
   setTimeout(() => playTone(659.25, 0.1, 'sine', 0.1), 100); 
   setTimeout(() => playTone(783.99, 0.2, 'sine', 0.1), 200); 
   setTimeout(() => playTone(1046.50, 0.4, 'sine', 0.1), 300); 
};

const playFoldSound = () => {
    playTone(200, 0.2, 'triangle', 0.05);
    setTimeout(() => playTone(150, 0.3, 'triangle', 0.05), 100);
};

const playCallSound = () => {
    // 2 quick chips
    playChipSound();
    setTimeout(playChipSound, 100);
};

const playRaiseSound = () => {
    // Aggressive slide up
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
    } catch(e) {}
};

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
  const { pokerState, pokerQueue, pokerRooms, username, joinRequests, removeJoinRequest, setPokerQueue, setPendingJoinRequest, pendingJoinRequest } = useStore();
  const [raiseAmount, setRaiseAmount] = useState(0);
  const [inQueue, setInQueue] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [lobbyView, setLobbyView] = useState('menu'); // 'menu' | 'join' | 'queue'

  // Reset queue state when entering a game
  useEffect(() => {
    if (pokerState && pokerState.status !== 'WAITING') {
      setInQueue(false);
      setLobbyView('menu');
    }
    if (!pokerState) {
      setInQueue(false);
      setLobbyView('menu');
      socket.emit('poker_list_rooms');
      setPendingJoinRequest(false);
    }
  }, [pokerState]);

  // Sync state actions
  useEffect(() => {
     if (pokerState && pokerState.minRaise) {
         setRaiseAmount(pokerState.minRaise);
     }
  }, [pokerState?.minRaise]);

  // Global Audio Unlocker for iOS
  useEffect(() => {
      const unlockAudio = () => {
          initAudio();
          document.removeEventListener('pointerdown', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
      };
      document.addEventListener('pointerdown', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);
      return () => {
          document.removeEventListener('pointerdown', unlockAudio);
          document.removeEventListener('touchstart', unlockAudio);
      };
  }, []);

  // Sons automatiques
  const potRef = React.useRef(0);
  const cardsRef = React.useRef(0);
  const statusRef = React.useRef('');

  useEffect(() => {
     if (!pokerState) return;
     
     if (pokerState.pot > potRef.current) playChipSound();
     if (pokerState.communityCards.length > cardsRef.current) playCardSound();
     if (pokerState.status === 'SHOWDOWN' && statusRef.current !== 'SHOWDOWN') playWinSound();
     if (pokerState.status === 'ENDED' && statusRef.current !== 'ENDED') playWinSound();

     potRef.current = pokerState.pot;
     cardsRef.current = pokerState.communityCards.length;
     statusRef.current = pokerState.status;
  }, [pokerState]);

  const handleQuickMatch = () => {
    initAudio();
    socket.emit('poker_quickmatch', username);
    setInQueue(true);
    setLobbyView('queue');
  };

  const handleLeaveQueue = () => {
    socket.emit('poker_leave_queue');
    setInQueue(false);
    setPokerQueue(null);
    setLobbyView('menu');
  };

  const handleQueueStartBots = () => {
    initAudio();
    socket.emit('poker_queue_start_bots');
  };

  const handleCreate = () => {
    initAudio();
    socket.emit('poker_create', username);
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    initAudio();
    socket.emit('poker_join', { username, roomCode: joinCode.trim() });
    setJoinCode('');
    setLobbyView('menu');
  };

  const handleQuickJoin = (code) => {
    initAudio();
    socket.emit('poker_request_join', { username, roomCode: code });
  };

  const handleApproveJoin = (req) => {
    socket.emit('poker_approve_join', { targetSocketId: req.socketId, roomCode: pokerState?.tableId });
    removeJoinRequest(req.socketId);
  };

  const handleDenyJoin = (req) => {
    socket.emit('poker_deny_join', { targetSocketId: req.socketId, roomCode: pokerState?.tableId });
    removeJoinRequest(req.socketId);
  };

  const handleStartBots = () => {
    initAudio();
    socket.emit('poker_start_bots');
  };

  const handleAction = (action) => {
    initAudio();
    if (action === 'fold') playFoldSound();
    if (action === 'call') playCallSound();
    if (action === 'raise') playRaiseSound();
    
    socket.emit('poker_action', { action, amount: raiseAmount });
  };

  const handleLeave = () => {
    if (window.confirm("Abandonner la partie ? Tu perdras définitivement ta mise initiale !")) {
      socket.emit('poker_leave');
    }
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
           {!myPlayer ? (
             <>
               <img src="/images/poker-saloon.jpg" alt="Poker" style={{width: '100%', maxWidth: 280, borderRadius: 14, marginBottom: 15, opacity: 0.9}} />
               <h1>♠️ SALOON EXPRESSO</h1>
               <p>Mise de départ : <b>100 🟡</b></p>

               {lobbyView === 'join' ? (
                 <div className="join-form">
                   <p style={{color:'white', marginBottom: 10}}>Entre le code de la salle :</p>
                   <input
                     className="code-input"
                     type="text"
                     maxLength={4}
                     placeholder="ABCD"
                     value={joinCode}
                     onChange={e => setJoinCode(e.target.value.toUpperCase())}
                     autoFocus
                     style={{ fontSize: 16 }}
                   />
                   <div className="join-form-btns">
                     <button className="btn-back" onClick={() => setLobbyView('menu')}>← Retour</button>
                     <button className="btn-join" onClick={handleJoinRoom} disabled={joinCode.length < 4}>Rejoindre</button>
                   </div>
                 </div>
               ) : !inQueue ? (
                 <div className="lobby-menu">
                   <button className="btn-create" onClick={handleQuickMatch}>🃏 Jouer au Poker</button>
                   <button className="btn-join-code" onClick={handleCreate}>🃏 Créer une partie</button>
                   <button className="btn-join-code" onClick={() => setLobbyView('join')}>🔑 Rejoindre une partie</button>

                   {pendingJoinRequest && (
                     <div className="pending-request">
                       <div className="pending-spinner"></div>
                       <p style={{color: '#ffcc00', fontWeight: 'bold', marginTop: 10}}>En attente d'approbation...</p>
                       <button className="btn-back" onClick={() => setPendingJoinRequest(false)} style={{marginTop: 8}}>Annuler</button>
                     </div>
                   )}

                   {pokerRooms && pokerRooms.length > 0 && (
                     <div className="open-rooms">
                       <p className="open-rooms-title">Parties ouvertes</p>
                       {pokerRooms.map(room => (
                         <button key={room.code} className="room-card" onClick={() => handleQuickJoin(room.code)}>
                           <span className="room-code">{room.code}</span>
                           <span className="room-players">{room.players.join(', ')}</span>
                           <span className="room-count">{room.count}/3</span>
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               ) : (
                 <div className="queue-waiting">
                   <div className="queue-dots">
                     <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>●</motion.span>
                     <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>●</motion.span>
                     <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}>●</motion.span>
                   </div>
                   <p style={{color: '#00ff66', fontWeight: 'bold', fontSize: '1.1rem', margin: '10px 0 5px'}}>
                     Recherche de joueurs... {pokerQueue ? `${pokerQueue.size}/3` : '1/3'}
                   </p>
                   {pokerQueue && pokerQueue.players && pokerQueue.players.length > 0 && (
                     <div className="queue-players">
                       {pokerQueue.players.map((name, i) => (
                         <span key={i} className="queue-player-tag">{name}</span>
                       ))}
                     </div>
                   )}
                   <p style={{color: '#888', fontSize: '0.8rem', margin: '8px 0'}}>Dès que 3 joueurs sont prêts, la partie se lance</p>
                   <div style={{display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10}}>
                     <button className="btn-bots" onClick={handleQueueStartBots}>🤖 Jouer avec l'IA</button>
                     <button className="btn-back" onClick={handleLeaveQueue}>Annuler</button>
                   </div>
                 </div>
               )}
             </>
           ) : (
             <div className="lobby-waiting">
                <h1>♠️ SALOON EXPRESSO</h1>
                <div className="room-code-display">
                  <span className="room-code-label">Code de la salle</span>
                  <span className="room-code-big">{pokerState.tableId}</span>
                </div>
                <p>En attente d'autres joueurs... ({pokerState.players.length}/3)</p>
                <div className="lobby-players">
                   {pokerState.players.map(p => <span key={p.id}>{p.username} </span>)}
                </div>

                {/* Join Requests */}
                <AnimatePresence>
                  {joinRequests.map(req => (
                    <motion.div
                      key={req.socketId}
                      className="join-request-card"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <span className="join-req-name">🖐️ <b>{req.username}</b> veut rejoindre</span>
                      <div className="join-req-btns">
                        <button className="btn-approve" onClick={() => handleApproveJoin(req)}>✓</button>
                        <button className="btn-deny" onClick={() => handleDenyJoin(req)}>✕</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <button className="btn-bots" onClick={handleStartBots}>Lancer avec des IA</button>
             </div>
           )}
        </div>
      ) : pokerState.status === 'SPINNING' ? (() => {
        const SEGMENTS = [200, 300, 400, 600, 1000, 1500, 200, 300, 400, 600, 1000, 1500];
        // Use server-computed angle for perfect sync
        const totalRotation = pokerState.wheelTargetAngle || (360 * 8 + 15);

        return (
        <div className="poker-spinner">
           <h2>TIRAGE DU MAGOT !</h2>
           
           <div className="wheel-pointer">▼</div>
           <motion.div 
             className="jackpot-wheel"
             initial={{ rotate: 0 }}
             animate={{ rotate: totalRotation }}
             transition={{ duration: 5, ease: [0.15, 0.60, 0.10, 1.00] }}
             onUpdate={(v) => {
                 if (Math.random() < 0.10 && v.rotate > 100) playCardSound();
             }}
           >
              {SEGMENTS.map((amt, i) => (
                <div key={i} className="wheel-segment" style={{
                  transform: `rotate(${i * 30 - 90 + 15}deg)`,
                }}>
                  <span className="seg-label">{amt}</span>
                </div>
              ))}
              <div className="wheel-center-logo">🎰</div>
           </motion.div>

           <AnimatePresence>
             {pokerState.prizePool > 0 && (
               <motion.div 
                 className="jackpot-reveal"
                 initial={{ scale: 0, opacity: 0, y: 20 }}
                 animate={{ scale: [0, 1.4, 1], opacity: 1, y: 0 }}
                 transition={{ delay: 5.2, duration: 1.2, type: 'spring', bounce: 0.5 }}
               >
                  <div className="jackpot-label">💰 JACKPOT 💰</div>
                  <div className="jackpot-amount">{pokerState.prizePool} 🟡</div>
                  <div className="jackpot-subtitle">à remporter ce round !</div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
        ); })() : (
        <div className="poker-table-container">
            {/* TOP INFO BAR */}
            <div className="poker-top-bar">
                <button className="btn-leave-table" onClick={handleLeave}>✕ Quitter</button>
                <div className="top-bar-info">
                    <span className="top-pot">POT: {pokerState.pot} 🟡</span>
                    {pokerState.prizePool > 0 && <span className="top-prize">Gain: {pokerState.prizePool} 🟡</span>}
                </div>
            </div>

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

                   {/* Center / Community Cards only */}
                   <div className="table-center">
                       <div className="community-cards">
                           {pokerState.communityCards.map((c, i) => <PokerCard key={i} card={c} />)}
                       </div>
                       {pokerState.lastAction && (
                           <div className="last-action-log">{pokerState.lastAction}</div>
                       )}
                   </div>

                   {/* My Player */}
                   {myPlayer && (
                        <div className={`seat my-seat active ${myPlayer.folded ? 'folded' : ''}`}>
                            <div className="player-info">
                                <span className="player-name">{myPlayer.username}</span>
                                <span className="player-chips">{myPlayer.chips} 🟡</span>
                                {myPlayer.currentBet > 0 && <span className="player-bet">Mise: {myPlayer.currentBet}</span>}
                            </div>
                            <div className="my-cards">
                                {myPlayer.cards.map((c, i) => <PokerCard key={i} card={c} />)}
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

            {/* WIN SCREEN */}
            <AnimatePresence>
               {pokerState.status === 'ENDED' && pokerState.winners.includes(username) && (
                  <motion.div 
                     className="poker-win-screen"
                     initial={{ opacity: 0, scale: 0.5 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0 }}
                  >
                     <div className="win-content">
                        <h1>🏆 VICTOIRE ! 🏆</h1>
                        <p>Tu remportes le tournoi !</p>
                        <h2 className="win-amount">+{pokerState.prizePool} 🟡</h2>
                        <span className="win-note">(Ton compte a été crédité)</span>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
        </div>
      )}

      <style>{`
        .page-poker {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 0 0 40px 0;
        }

        /* LOBBY */
        .poker-lobby {
          text-align: center;
          background: rgba(0,0,0,0.8);
          padding: 30px 25px;
          border-radius: 20px;
          border: 2px solid #00ff66;
          box-shadow: 0 0 50px rgba(0, 255, 102, 0.2);
          width: 90%;
          max-width: 340px;
        }
        .poker-lobby h1 { color: #00ff66; margin-bottom: 5px; font-weight: 900; font-size: 1.3rem; }
        .poker-lobby p { color: #aaa; margin-bottom: 15px; }

        .lobby-menu { display: flex; flex-direction: column; gap: 12px; }

        .btn-create { background: #00ff66; color: black; font-weight: bold; font-size: 1.1rem; padding: 14px 20px; border: none; border-radius: 10px; cursor: pointer; }
        .btn-create:active { transform: scale(0.95); }

        .btn-join-code { background: transparent; color: #00ffcc; font-weight: bold; font-size: 1rem; padding: 12px 20px; border: 2px solid #00ffcc; border-radius: 10px; cursor: pointer; }
        .btn-join-code:active { transform: scale(0.95); }

        .open-rooms { margin-top: 8px; }
        .open-rooms-title { color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
        .room-card {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(0,255,102,0.3);
          border-radius: 10px; padding: 10px 14px; width: 100%; cursor: pointer;
          margin-bottom: 6px; color: white; font-size: 0.9rem;
        }
        .room-card:active { background: rgba(0,255,102,0.15); }
        .room-code { font-weight: 900; color: #ffcc00; font-family: monospace; font-size: 1.1rem; }
        .room-players { color: #aaa; flex: 1; text-align: center; font-size: 0.8rem; }
        .room-count { color: #00ff66; font-weight: bold; }

        .join-form { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .code-input {
          background: rgba(255,255,255,0.1); border: 2px solid #00ffcc; border-radius: 12px;
          color: white; font-size: 2rem; font-weight: 900; font-family: monospace;
          text-align: center; padding: 12px; width: 160px; letter-spacing: 8px;
          outline: none;
        }
        .code-input::placeholder { color: rgba(255,255,255,0.2); letter-spacing: 4px; }
        .join-form-btns { display: flex; gap: 10px; }
        .btn-back { background: transparent; color: #aaa; border: 1px solid #555; border-radius: 8px; padding: 10px 16px; cursor: pointer; font-weight: bold; }
        .btn-join { background: #00ff66; color: black; font-weight: bold; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
        .btn-join:disabled { opacity: 0.4; }
        .btn-join:active { transform: scale(0.95); }

        .btn-bots { background: #ffcc00; color: black; font-weight: bold; padding: 10px 20px; border: none; border-radius: 8px; margin-top: 15px; cursor: pointer; }
        .btn-bots:active { transform: scale(0.95); }

        .queue-waiting { text-align: center; }
        .queue-dots { display: flex; gap: 8px; justify-content: center; font-size: 1.5rem; color: #00ff66; }
        .queue-players { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 8px 0; }
        .queue-player-tag {
          background: rgba(0,255,102,0.15); border: 1px solid rgba(0,255,102,0.4);
          color: #00ff66; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold;
        }

        .lobby-waiting { color: white; }
        .lobby-players { margin-top: 10px; font-weight: bold; color: #00ffcc; }

        .room-code-display {
          display: flex; flex-direction: column; align-items: center;
          background: rgba(255,204,0,0.1); border: 2px dashed #ffcc00;
          border-radius: 14px; padding: 15px; margin: 15px 0;
        }
        .room-code-label { color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 2px; }
        .room-code-big { font-size: 2.5rem; font-weight: 900; font-family: monospace; color: #ffcc00; letter-spacing: 10px; margin: 5px 0; }
        .room-code-hint { color: #aaa; font-size: 0.75rem; }

        /* SPINNER (Twister) */
        .poker-spinner { text-align: center; color: white; position: relative; }
        
        .wheel-pointer {
           font-size: 2.5rem; color: #ffeb3b;
           position: absolute; top: 35px; left: 50%; transform: translateX(-50%);
           z-index: 10; text-shadow: 0 4px 10px rgba(0,0,0,0.8);
           filter: drop-shadow(0 0 5px #ffeb3b);
        }

        .jackpot-wheel {
          width: 220px; height: 220px; border-radius: 50%;
          border: 6px solid #333; margin: 30px auto;
          background: conic-gradient(
             #e53935 0deg 30deg, #1e88e5 30deg 60deg, 
             #43a047 60deg 90deg, #fdd835 90deg 120deg, 
             #8e24aa 120deg 150deg, #e53935 150deg 180deg, 
             #1e88e5 180deg 210deg, #43a047 210deg 240deg, 
             #fdd835 240deg 270deg, #8e24aa 270deg 300deg,
             #ff9800 300deg 330deg, #00acc1 330deg 360deg
          );
          box-shadow: 0 0 40px #ffcc00, inset 0 0 20px rgba(0,0,0,0.5); 
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }

        .wheel-segment {
          position: absolute;
          width: 50%; height: 0;
          top: 50%; left: 50%;
          transform-origin: 0% 50%;
        }
        .seg-label {
          position: absolute;
          left: 55px; top: -7px;
          color: white;
          font-weight: 900;
          font-size: 0.7rem;
          text-shadow: 1px 1px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7);
          pointer-events: none;
        }
        
        .wheel-center-logo {
          width: 50px; height: 50px; background: radial-gradient(circle, #fff, #bbb);
          border-radius: 50%; border: 4px solid #222;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          z-index: 2;
        }

        .jackpot-reveal {
          text-align: center; margin-top: 15px;
        }
        .jackpot-label {
          font-size: 1.2rem; font-weight: 900; color: #fff;
          letter-spacing: 3px; margin-bottom: 5px;
          text-shadow: 0 0 10px rgba(255,204,0,0.6);
        }
        .jackpot-amount {
          font-size: 4rem; font-weight: 900; color: #ffeb3b;
          text-shadow: 0 0 30px #ffcc00, 0 0 60px #ff9800;
          animation: jackpotPulse 0.8s ease-in-out infinite alternate;
        }
        .jackpot-subtitle {
          font-size: 0.85rem; color: #aaa; font-style: italic; margin-top: 5px;
        }
        @keyframes jackpotPulse {
          0% { text-shadow: 0 0 20px #ffcc00; transform: scale(1); }
          100% { text-shadow: 0 0 40px #ff9800, 0 0 80px #ffcc00; transform: scale(1.05); }
        }

        /* TABLE */
        .poker-table-container {
          width: 100%;
          height: calc(100vh - var(--safe-top, 0px) - var(--header-height, 60px) - var(--tab-height, 60px) - var(--safe-bottom, 0px) - 40px);
          min-height: 400px;
          display: flex;
          flex-direction: column;
          position: relative;
          background-color: transparent;
          color: white;
        }

        .tapis-vert {
          flex: 1;
          margin: 0;
          margin-bottom: 10px;
          background: #0f4f25;
          border-radius: 40px;
          border: 4px solid #1a1a1a;
          box-shadow: inset 0 0 50px rgba(0,0,0,0.6), 0 10px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          min-height: 250px;
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
          background: transparent;
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

        .my-seat { bottom: 5%; left: 50%; transform: translateX(-50%); }

        .player-info {
           background: rgba(0,0,0,0.7);
           border-radius: 6px;
           padding: 4px 8px;
           text-align: center;
           color: white;
           z-index: 2;
           font-size: 0.8rem;
           white-space: nowrap;
        }
        .player-name { font-weight: bold; display: block; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }
        .player-chips { color: #ffeb3b; font-weight: bold; }

        .player-bet {
           background: rgba(0, 0, 0, 0.6);
           color: #fff;
           padding: 2px 6px;
           border-radius: 8px;
           font-size: 0.75rem;
           margin-top: 5px;
           font-weight: bold;
           border: 1px solid #4ade80;
        }

        .my-bet {
           position: absolute;
           top: -25px;
           background: rgba(0, 0, 0, 0.6);
           color: #fff;
           padding: 2px 6px;
           border-radius: 8px;
           font-size: 0.75rem;
           font-weight: bold;
           border: 1px solid #4ade80;
        }

        .player-cards {
           display: flex;
           gap: 2px;
           margin-top: 5px;
        }
        .my-cards {
           display: flex;
           flex-direction: row;
           gap: 5px;
           margin-top: 5px;
           margin-bottom: 5px;
           z-index: 1;
           transform: scale(1.1);
        }

        /* CENTER AREA */
        .table-center {
           position: absolute;
           top: 50%; left: 50%;
           transform: translate(-50%, -50%);
           display: flex; flex-direction: column; align-items: center;
           gap: 10px;
        }

        .pot-hud {
           background: rgba(0,0,0,0.8); padding: 5px 20px; border-radius: 20px;
           color: white; font-weight: 900; font-size: 1.1rem;
           border: 1px solid #ffcc00; text-align: center; z-index: 5;
           white-space: nowrap; box-shadow: 0 5px 15px rgba(0,0,0,0.5);
           margin-bottom: 5px;
        }

        .community-cards {
           display: flex;
           gap: 3px;
        }

        .last-action-log {
           position: absolute; bottom: -30px;
           background: rgba(0,0,0,0.6); color: white;
           padding: 3px 15px; border-radius: 10px;
           font-size: 0.8rem; font-style: italic; white-space: nowrap;
        }

        /* CARDS CSS */
        .poker-card {
           width: 35px;
           height: 50px;
           background: white;
           border-radius: 4px;
           box-shadow: 1px 1px 4px rgba(0,0,0,0.5);
           display: flex; flex-direction: column; justify-content: space-between;
           padding: 2px 3px; font-family: 'Courier New', monospace;
           font-weight: 900; font-size: 0.75rem; position: relative; user-select: none;
        }
        .poker-card:not(:first-child) {
           margin-left: -10px;
        }

        .community-cards .poker-card {
           width: 45px; height: 65px; margin-left: 0; font-size: 0.8rem;
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

        .btn-fold { background: #334155; color: white; }
        .btn-call { background: #4ade80; color: black; }
        .btn-raise { background: #a855f7; color: white; }

        /* TOP INFO BAR */
        .poker-top-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 12px;
            background: rgba(0,0,0,0.6);
            border-radius: 12px;
            margin-bottom: 8px;
        }
        .btn-leave-table {
            background: rgba(255,60,60,0.15);
            color: #ff6b6b;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 6px 12px;
            border: 1px solid rgba(255,60,60,0.3);
            border-radius: 8px;
            cursor: pointer;
            white-space: nowrap;
        }
        .top-bar-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .top-pot {
            color: #fff;
            font-weight: 900;
            font-size: 0.85rem;
        }
        .top-prize {
            color: #ffcc00;
            font-weight: 700;
            font-size: 0.75rem;
            background: rgba(255,204,0,0.1);
            padding: 3px 8px;
            border-radius: 8px;
            border: 1px solid rgba(255,204,0,0.3);
        }

        /* WIN SCREEN */
        .poker-win-screen {
            position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            display: flex; align-items: center; justify-content: center;
            z-index: 200;
        }
        .win-content {
            text-align: center; color: white;
            animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .win-content h1 { color: #ffeb3b; font-size: 3rem; text-shadow: 0 0 20px #ffeb3b; margin-bottom: 5px; }
        .win-content p { font-size: 1.2rem; margin-bottom: 20px; }
        .win-amount { color: #39ff14; font-size: 4rem; font-weight: 900; text-shadow: 0 0 30px #39ff14; margin: 0; }
        .win-note { font-size: 0.8rem; color: #aaa; font-style: italic; }

        @keyframes bounceIn {
            0% { transform: scale(0); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        /* PENDING JOIN REQUEST */
        .pending-request { text-align: center; padding: 20px 0; }
        .pending-spinner {
          width: 40px; height: 40px; margin: 0 auto;
          border: 3px solid rgba(255,204,0,0.2);
          border-top-color: #ffcc00;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* JOIN REQUEST CARDS (creator sees these) */
        .join-request-card {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,204,0,0.1); border: 1px solid #ffcc00;
          border-radius: 10px; padding: 10px 14px; margin-top: 10px;
        }
        .join-req-name { color: white; font-size: 0.9rem; }
        .join-req-btns { display: flex; gap: 8px; }
        .btn-approve {
          background: #00ff66; color: black; font-weight: 900; font-size: 1.1rem;
          border: none; border-radius: 8px; width: 38px; height: 34px; cursor: pointer;
        }
        .btn-deny {
          background: #ff3333; color: white; font-weight: 900; font-size: 1.1rem;
          border: none; border-radius: 8px; width: 38px; height: 34px; cursor: pointer;
        }

      `}</style>
    </motion.div>
  );
}
