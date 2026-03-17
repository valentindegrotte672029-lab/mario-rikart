import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import NeonIcon from './NeonIcon';

export default function ToadBankMobile() {
  const { balance, lastGlitchPurchase, username, currentPage, setPage, logout } = useStore();

  const handleLogout = () => {
    if (window.confirm("🔴 Veux-tu vraiment te déconnecter de ton profil ?")) {
      logout();
    }
  };

  return (
    <div className="toad-bank-header">
      <div className="glass-panel header-container">

        <div className="left-group">


          <div className="bank-info">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentPage}
                className="bank-title"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
              >
                {currentPage}
              </motion.span>
            </AnimatePresence>
            <span className="bank-balance">{balance.toLocaleString('fr-FR')} <NeonIcon name="coin-gold" size={16} /></span>
          </div>
        </div>

        <div className="profile-pic" onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white' }}>
            {username ? username.substring(0, 2) : <NeonIcon name="red-mushroom-spotted" size={18} />}
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
            <NeonIcon name="warning-triangle" size={16} /> {lastGlitchPurchase}
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
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .bank-balance .neon-icon {
          -webkit-text-fill-color: initial;
          background: none;
          -webkit-background-clip: initial;
        }

        .profile-pic {
          width: 45px;
          height: 45px;
          background: transparent;
          border-radius: 0;
          border: none;
          box-shadow: none;
          filter: drop-shadow(0 0 8px rgba(255, 0, 85, 0.5)) drop-shadow(0 0 18px rgba(255, 204, 0, 0.3));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          transition: transform 0.2s;
          cursor: pointer;
        }

        .profile-pic:active {
          transform: scale(0.9);
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
}
