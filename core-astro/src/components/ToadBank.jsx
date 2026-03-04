import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';

export default function ToadBankMobile() {
  const { balance, lastGlitchPurchase, username, currentPage, setPage } = useStore();

  return (
    <div className="toad-bank-header">
      <div className="glass-panel header-container">

        <div className="left-group">
          <AnimatePresence>
            {currentPage !== 'HOME' && (
              <motion.button
                className="header-home-btn"
                initial={{ scale: 0, opacity: 0, width: 0, marginRight: 0 }}
                animate={{ scale: 1, opacity: 1, width: '35px', marginRight: 10 }}
                exit={{ scale: 0, opacity: 0, width: 0, marginRight: 0 }}
                onClick={() => setPage('HOME')}
              >
                🏠
              </motion.button>
            )}
          </AnimatePresence>

          <div className="bank-info">
            <span className="bank-title">TOAD BANK</span>
            <span className="bank-balance">{balance.toLocaleString('fr-FR')} 🟡</span>
          </div>
        </div>

        <div className="profile-pic">
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
            {username ? username.substring(0, 2) : '🍄'}
          </span>
        </div>

      </div>

      <AnimatePresence>
        {lastGlitchPurchase && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="glitch-toast glass-panel"
          >
            ⚠️ {lastGlitchPurchase}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .toad-bank-header {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: calc(var(--safe-top) + 10px) 15px 0 15px;
          z-index: 100;
          pointer-events: none; /* Ne bloque pas les clics en dessous sauf sur l'enfant */
        }

        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 15px;
          border-radius: 20px;
          pointer-events: auto;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .left-group {
          display: flex;
          align-items: center;
        }

        .header-home-btn {
          height: 35px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(5px);
          overflow: hidden;
        }
        .header-home-btn:active {
          transform: scale(0.9) !important;
        }

        .bank-info {
          display: flex;
          flex-direction: column;
        }

        .bank-title {
          font-size: 0.75rem;
          color: #888;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .bank-balance {
          font-size: 1.2rem;
          font-weight: 900;
          background: -webkit-linear-gradient(#ffee00, #ffaa00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .profile-pic {
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .glitch-toast {
          margin-top: 10px;
          padding: 10px 15px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          color: #ff3366;
          text-align: center;
          border-color: rgba(255, 51, 102, 0.3);
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
