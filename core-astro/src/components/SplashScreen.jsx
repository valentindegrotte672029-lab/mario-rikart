import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

import useStore from '../store/useStore';

export default function SplashScreen() {
  const [inputValue, setInputValue] = useState('');
  const { setUsername } = useStore();

  const handleJoin = (e) => {
    e.preventDefault();
    if (inputValue.trim().length > 2) {
      if (window.navigator?.vibrate) window.navigator.vibrate([20, 50, 20]);
      setUsername(inputValue.trim().toUpperCase());
    }
  };

  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      transition={{ duration: 0.6 }}
    >
      <div className="glass-panel splash-card">
        <h1 className="splash-title">V2026</h1>
        <p className="splash-subtitle">MARIO RIKART EXPERIENCE</p>

        <form onSubmit={handleJoin} className="splash-form">
          <input
            type="text"
            placeholder="Écris ton alias..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="splash-input"
            maxLength={12}
            autoFocus
          />
          <button
            type="submit"
            className="splash-btn"
            disabled={inputValue.trim().length < 3}
          >
            ENTRER DANS LE KART
          </button>
        </form>
      </div>

      <style>{`
        .splash-screen {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          background-image: radial-gradient(circle at center, rgba(0, 255, 204, 0.1) 0%, transparent 70%);
        }

        .splash-card {
          padding: 40px 30px;
          border-radius: 30px;
          text-align: center;
          width: 85%;
          max-width: 400px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(0, 255, 204, 0.1);
          border: 1px solid rgba(0, 255, 204, 0.3);
        }

        .splash-title {
          font-size: 3.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #00ffcc, #0088ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 5px;
        }

        .splash-subtitle {
          font-size: 0.8rem;
          letter-spacing: 3px;
          color: #aaa;
          margin-bottom: 30px;
        }

        .splash-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .splash-input {
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          padding: 15px;
          border-radius: 15px;
          font-size: 1.2rem;
          text-align: center;
          font-weight: bold;
          outline: none;
          transition: border-color 0.3s;
        }

        .splash-input:focus {
          border-color: #00ffcc;
        }

        .splash-btn {
          background: #00ffcc;
          color: black;
          border: none;
          padding: 18px;
          border-radius: 15px;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }

        .splash-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .splash-btn:not(:disabled):active {
          transform: scale(0.95);
        }
      `}</style>
    </motion.div>
  );
}
