/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind } from 'lucide-react';

import FlappyWeed from './minigames/FlappyWeed';
import ChampiNinja from './minigames/ChampiNinja';
import DoodleWeed from './minigames/DoodleWeed';

import useStore from '../store/useStore';

export default function PageLuigiNew() {
  const { username, leaderboards, clearHappening } = useStore();
  const [cleaning, setCleaning] = useState(false);
  const [activeGame, setActiveGame] = useState(null);

  const handleClean = () => {
    setCleaning(true);
    if (window.navigator?.vibrate) window.navigator.vibrate([30, 50, 30]);
    clearHappening(); // "Aspirer" really cleans the global happening block
    setTimeout(() => setCleaning(false), 2000);
  };

  return (
    <motion.div
      className="page-mobile luigi-mobile"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="gas-ambient"></div>

      <div className="glass-panel mobile-card luigi-card">
        <div className="card-header" style={{ marginBottom: '15px' }}>
          <h1 className="title-mobile">LUI-WEED ARCADE</h1>
          <p className="subtitle">"Farm des pièces pour les potos !"</p>
        </div>

        <div className="arcade-grid">
          <button className="arcade-btn flappyweed-btn" onClick={() => setActiveGame('FLAPPYWEED')}>
            <span className="game-icon">🪽</span>
            <div className="game-info">
              <h3>ROULE-TA-FLEUR</h3>
              <p>Evite les tuyaux en volant.</p>
            </div>
            <div className="play-tag">JOUER</div>
          </button>

          <button className="arcade-btn champininja-btn" onClick={() => setActiveGame('CHAMPININJA')}>
            <span className="game-icon">🍄</span>
            <div className="game-info">
              <h3>CHAMPI NINJA</h3>
              <p>Taille les champis, évite les bombes.</p>
            </div>
            <div className="play-tag">JOUER</div>
          </button>

          <button className="arcade-btn doodleweed-btn" onClick={() => setActiveGame('DOODLEWEED')}>
            <span className="game-icon">🚀</span>
            <div className="game-info">
              <h3>DOODLE-WEED</h3>
              <p>Monte le plus haut possible !</p>
            </div>
            <div className="play-tag">JOUER</div>
          </button>
        </div>

        {/* --- LEADERBOARD SECTION --- */}
        <div className="leaderboard-section">
          <h3 className="lb-title">🏆 Meilleurs Scores Mondiaux</h3>

          <div className="lb-row">
            <span className="lb-game">🪽 Roule-Ta-Fleur</span>
            <div className="lb-scores-wrapper">
              {leaderboards.FLAPPYWEED?.[username] && (
                <span className="lb-personal">Moi: {leaderboards.FLAPPYWEED[username].score}</span>
              )}
              <span className="lb-score">
                Top: {Object.values(leaderboards.FLAPPYWEED || {}).sort((a, b) => b.score - a.score)[0]?.score || 0}
              </span>
            </div>
          </div>

          <div className="lb-row">
            <span className="lb-game">🍄 Champi Ninja</span>
            <div className="lb-scores-wrapper">
              {leaderboards.CHAMPININJA?.[username] && (
                <span className="lb-personal">Moi: {leaderboards.CHAMPININJA[username].score}</span>
              )}
              <span className="lb-score">
                Top: {Object.values(leaderboards.CHAMPININJA || {}).sort((a, b) => b.score - a.score)[0]?.score || 0}
              </span>
            </div>
          </div>

          <div className="lb-row">
            <span className="lb-game">🚀 Doodle-Weed</span>
            <div className="lb-scores-wrapper">
              {leaderboards.DOODLEWEED?.[username] && (
                <span className="lb-personal">Moi: {leaderboards.DOODLEWEED[username].score}</span>
              )}
              <span className="lb-score">
                Top: {Object.values(leaderboards.DOODLEWEED || {}).sort((a, b) => b.score - a.score)[0]?.score || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeGame === 'FLAPPYWEED' && <FlappyWeed key="flappyweed" onExit={() => setActiveGame(null)} />}
        {activeGame === 'CHAMPININJA' && <ChampiNinja key="champininja" onExit={() => setActiveGame(null)} />}
        {activeGame === 'DOODLEWEED' && <DoodleWeed key="doodleweed" onExit={() => setActiveGame(null)} />}
      </AnimatePresence>

      <style>{`
        .luigi-mobile {
          --theme-color: #39ff14;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow-y: auto;
          overflow-x: hidden;
          padding: calc(var(--safe-top) + 15px) 15px 30px 15px; /* Reduced bottom padding */
        }

        .gas-ambient {
          position: absolute;
          top: -20%; left: -20%; right: -20%; bottom: -20%;
          background: radial-gradient(circle at center, rgba(57, 255, 20, 0.15) 0%, transparent 60%);
          animation: breathe 5s ease-in-out infinite alternate;
          z-index: -1;
        }

        @keyframes breathe {
          from { transform: scale(0.9); opacity: 0.5; }
          to { transform: scale(1.1); opacity: 1; }
        }

        .mobile-card {
          width: 100%;
          padding: 20px 15px; /* More compact */
          border-radius: 32px;
          border-color: rgba(57, 255, 20, 0.2);
          box-shadow: 0 10px 40px rgba(0, 50, 0, 0.5);
          position: relative;
          z-index: 10;
        }

        .card-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .title-mobile {
          color: var(--theme-color);
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: -1px;
          text-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
        }

        .subtitle {
          color: #aaffaa;
          font-size: 0.9rem;
          margin-top: 5px;
          opacity: 0.8;
        }

        .arcade-grid { display: flex; flex-direction: column; gap: 8px; margin-top: 5px; } /* Tighter gap */
        
        .arcade-btn {
          display: flex; align-items: center; background: rgba(0,0,0,0.6);
          border: 1px solid rgba(57, 255, 20, 0.3); border-radius: 16px; /* Smaller radius */
          padding: 10px 12px 10px 10px; color: white; text-align: left; cursor: pointer; /* Tighter padding */
          transition: transform 0.1s, box-shadow 0.2s; position: relative; overflow: hidden;
        }
        .arcade-btn:active { transform: scale(0.97); }
        
        .pacweed-btn { background: linear-gradient(90deg, rgba(0,20,0,1) 0%, rgba(10,50,10,1) 100%); border-color: var(--theme-color); box-shadow: 0 4px 15px rgba(57,255,20,0.2); }
        
        .game-icon { font-size: 2rem; margin-right: 12px; filter: drop-shadow(0 0 5px var(--theme-color)); flex-shrink: 0; }
        .game-info { flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; padding-right: 65px; }
        .game-info h3 { font-size: 1rem; font-weight: 900; color: var(--theme-color); margin-bottom: 2px; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
        .game-info p { font-size: 0.7rem; color: #aaa; line-height: 1.2; }
        
        .play-tag { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: var(--theme-color); color: black; font-weight: 800; font-size: 0.7rem; padding: 4px 6px; border-radius: 6px; flex-shrink: 0; }
        
        .leaderboard-section {
          background: rgba(0,20,0,0.5); border: 1px solid rgba(57, 255, 20, 0.2);
          border-radius: 15px; padding: 15px; margin-top: 20px;
        }
        .lb-title { color: white; font-size: 1rem; text-align: center; margin-bottom: 15px; font-weight: bold; }
        .lb-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; align-items: center; }
        .lb-game { color: #aaffaa; }
        .lb-scores-wrapper { display: flex; align-items: center; gap: 10px; }
        .lb-personal { color: #ccc; font-size: 0.8rem; font-weight: bold; }
        .lb-score { color: var(--theme-color); font-weight: 900; background: rgba(0,0,0,0.5); padding: 4px 10px; border-radius: 12px; }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin: 25px 0;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 18px;
          border-radius: 20px;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .btn-icon { margin-right: 15px; }

        .btn-secondary:active {
          transform: scale(0.96);
        }

        .vacuum-btn.cleaning {
          border-color: var(--theme-color);
          color: var(--theme-color);
          background: rgba(57, 255, 20, 0.1);
        }
      `}</style>
    </motion.div >
  );
}
