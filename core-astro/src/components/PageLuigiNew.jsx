/* eslint-disable */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind } from 'lucide-react';

import FlappyWeed from './minigames/FlappyWeed';
import ChampiNinja from './minigames/ChampiNinja';
import DoodleWeed from './minigames/DoodleWeed';

import useStore from '../store/useStore';

export default function PageLuigiNew() {
  const { leaderboards, clearHappening } = useStore();
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
            <span className="lb-score">
              {Object.values(leaderboards.FLAPPYWEED || {}).sort((a, b) => b.score - a.score)[0]?.score || 0} pts
            </span>
          </div>

          <div className="lb-row">
            <span className="lb-game">🍄 Champi Ninja</span>
            <span className="lb-score">
              {Object.values(leaderboards.CHAMPININJA || {}).sort((a, b) => b.score - a.score)[0]?.score || 0} pts
            </span>
          </div>

          <div className="lb-row">
            <span className="lb-game">🚀 Doodle-Weed</span>
            <span className="lb-score">
              {Object.values(leaderboards.DOODLEWEED || {}).sort((a, b) => b.score - a.score)[0]?.score || 0} pts
            </span>
          </div>
        </div>

        <div className="divider"></div>

        <button
          className={`btn-secondary vacuum-btn ${cleaning ? 'cleaning' : ''}`}
          onClick={handleClean}
        >
          <Wind size={24} className="btn-icon" />
          <span>{cleaning ? "Désenfumage..." : "Aspirer Notifs"}</span>
        </button>
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
          align-items: center;
          position: relative;
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
          padding: 30px 20px;
          border-radius: 32px;
          border-color: rgba(57, 255, 20, 0.2);
          box-shadow: 0 10px 40px rgba(0, 50, 0, 0.5);
          position: relative;
          z-index: 10;
        }

        .card-header {
          text-align: center;
          margin-bottom: 30px;
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

        .arcade-grid { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }
        
        .arcade-btn {
          display: flex; align-items: center; background: rgba(0,0,0,0.6);
          border: 1px solid rgba(57, 255, 20, 0.3); border-radius: 20px;
          padding: 15px; color: white; text-align: left; cursor: pointer;
          transition: transform 0.1s, box-shadow 0.2s; position: relative; overflow: hidden;
        }
        .arcade-btn:active { transform: scale(0.97); }
        
        .pacweed-btn { background: linear-gradient(90deg, rgba(0,20,0,1) 0%, rgba(10,50,10,1) 100%); border-color: var(--theme-color); box-shadow: 0 4px 15px rgba(57,255,20,0.2); }
        
        .game-icon { font-size: 2.5rem; margin-right: 15px; filter: drop-shadow(0 0 5px var(--theme-color)); }
        .game-info h3 { font-size: 1.1rem; font-weight: 900; color: var(--theme-color); margin-bottom: 3px; letter-spacing: 1px; }
        .game-info p { font-size: 0.8rem; color: #888; }
        
        .play-tag { position: absolute; right: 15px; background: var(--theme-color); color: black; font-weight: 800; font-size: 0.8rem; padding: 5px 10px; border-radius: 10px; }
        
        .leaderboard-section {
          background: rgba(0,20,0,0.5); border: 1px solid rgba(57, 255, 20, 0.2);
          border-radius: 15px; padding: 15px; margin-top: 20px;
        }
        .lb-title { color: white; font-size: 1rem; text-align: center; margin-bottom: 15px; font-weight: bold; }
        .lb-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem; align-items: center; }
        .lb-game { color: #aaffaa; }
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
    </motion.div>
  );
}
