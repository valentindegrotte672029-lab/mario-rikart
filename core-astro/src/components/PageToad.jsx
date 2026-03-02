import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, FlaskConical } from 'lucide-react';
import useStore from '../store/useStore';

export default function PageToad() {
  const [mixValue, setMixValue] = useState(50);
  const [pollVoted, setPollVoted] = useState(false);
  const [voteResult, setVoteResult] = useState(80);

  const handleVote = () => {
    setPollVoted(true);
    if (window.navigator?.vibrate) window.navigator.vibrate(50);
  };

  const mixColor = `hsl(${120 - (mixValue * 1.2)}, 100%, 50%)`; // Vert (0) à Rouge (100)

  return (
    <motion.div
      className="page-mobile toad-mobile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="glass-panel mobile-card toad-card">
        <h1 className="title-mobile toad-title">PHARMACIE</h1>

        {/* Sondage Despartoad - Design Gauge Apple */}
        <section className="toad-section">
          <div className="section-header">
            <Vote size={20} color="#ff3366" />
            <h2>Sondage en ligne</h2>
          </div>
          <p className="caption">Quel mélange ce soir ?</p>

          {!pollVoted ? (
            <div className="poll-actions">
              <button className="vote-btn" onClick={() => { setVoteResult(80); handleVote(); }}>Ricard + Redbull</button>
              <button className="vote-btn dark" onClick={() => { setVoteResult(20); handleVote(); }}>Éthanol pur</button>
            </div>
          ) : (
            <div className="poll-results">
              <div className="gauge-row">
                <span className="gauge-label">Ton Vote vs Global ({voteResult}%)</span>
                <div
                  className="gauge-track interactive"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const newPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                    setVoteResult(Math.round(newPercent));
                    if (window.navigator?.vibrate) window.navigator.vibrate(20);
                  }}
                >
                  <motion.div
                    className="gauge-fill"
                    animate={{ width: `${voteResult}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                </div>
                <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '5px', textAlign: 'center' }}>
                  Touche la jauge pour tricher sur le sondage local
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Fuel Mixer Slider iOS Natif */}
        <section className="toad-section">
          <div className="section-header">
            <FlaskConical size={20} color={mixColor} />
            <h2>Fuel Mixer</h2>
          </div>

          <div className="slider-container">
            <input
              type="range"
              className="ios-slider"
              min="0" max="100"
              value={mixValue}
              onChange={(e) => setMixValue(e.target.value)}
              style={{ '--thumb-color': mixColor }}
            />
            <div className="mix-info" style={{ color: mixColor }}>
              Danger : {mixValue}%
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .toad-mobile {
          --theme-color: #ff3366;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          /* Légère vibration permanente de l'écran pour Toad */
          animation: toadShakes 0.2s infinite alternate;
        }

        @keyframes toadShakes {
          0% { transform: translateY(0.5px); }
          100% { transform: translateY(-0.5px); }
        }

        .toad-card {
          width: 100%;
          padding: 25px 20px;
          border-radius: 32px;
          border: 1px solid rgba(255, 51, 102, 0.3);
          background: rgba(25, 5, 10, 0.65);
        }

        .toad-title {
          color: white;
          font-size: 2rem;
          font-weight: 900;
          text-align: center;
          margin-bottom: 25px;
          text-shadow: 0 0 15px rgba(255, 51, 102, 0.8);
        }

        .toad-section {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 15px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 5px;
        }

        .section-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #eee;
        }

        .caption {
          font-size: 0.85rem;
          color: #aaa;
          margin-bottom: 15px;
        }

        .poll-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vote-btn {
          background: var(--theme-color);
          color: white;
          border: none;
          padding: 15px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 1rem;
          transition: transform 0.1s;
        }
        
        .vote-btn.dark {
          background: #331122;
          border: 1px solid var(--theme-color);
        }

        .vote-btn:active {
          transform: scale(0.97);
        }

        .gauge-row {
          margin-bottom: 12px;
        }

        .gauge-label {
          display: block;
          font-size: 0.8rem;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .gauge-track {
          width: 100%;
          height: 15px;
          background: rgba(255,255,255,0.1);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .gauge-track.interactive {
          cursor: pointer;
          height: 25px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .gauge-fill {
          height: 100%;
          background: var(--theme-color);
          border-radius: 8px;
          transform-origin: left;
        }

        .gauge-fill.red { background: #ff0000; }

        .slider-container {
          margin-top: 15px;
          text-align: center;
        }

        .ios-slider {
           -webkit-appearance: none;
           width: 100%;
           height: 12px;
           background: rgba(255,255,255,0.1);
           border-radius: 6px;
           outline: none;
        }

        .ios-slider::-webkit-slider-thumb {
           -webkit-appearance: none;
           appearance: none;
           width: 28px;
           height: 28px;
           border-radius: 50%;
           background: var(--thumb-color, white);
           box-shadow: 0 0 10px var(--thumb-color, white);
        }

        .mix-info {
          margin-top: 15px;
          font-weight: 900;
          font-size: 1.2rem;
        }
      `}</style>
    </motion.div>
  );
}
