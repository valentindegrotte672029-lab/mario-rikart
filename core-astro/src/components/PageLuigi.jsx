import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Wind } from 'lucide-react';
import useStore from '../store/useStore';

export default function PageLuigi() {
  const { spendCoins } = useStore();
  const [cleaning, setCleaning] = useState(false);
  const [smokes, setSmokes] = useState([]);

  const handleClean = () => {
    setCleaning(true);
    if (window.navigator?.vibrate) window.navigator.vibrate([30, 50, 30]); // Haptic
    setSmokes([]); // Retire toute la fumée d'un coup
    setTimeout(() => setCleaning(false), 2000);
  };

  const handleDistribute = () => {
    spendCoins(50000, "BÉDOS POUR LUIGI");
    if (window.navigator?.vibrate) window.navigator.vibrate(100);

    const newSmoke = {
      id: Date.now(),
      left: Math.random() * 80 + 10,
      size: Math.random() * 60 + 40,
      duration: Math.random() * 2 + 3,
    };
    setSmokes((prev) => [...prev, newSmoke]);

    setTimeout(() => {
      setSmokes((prev) => prev.filter(s => s.id !== newSmoke.id));
    }, newSmoke.duration * 1000);
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

      {/* Particules de fumée générées */}
      <AnimatePresence>
        {smokes.map(smoke => (
          <motion.div
            key={smoke.id}
            initial={{ opacity: 0, y: 0, scale: 0.5, x: smoke.left + 'vw' }}
            animate={{ opacity: [0, 0.6, 0], y: -500, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: smoke.duration, ease: "easeOut" }}
            className="smoke-particle"
            style={{
              width: smoke.size,
              height: smoke.size,
              left: 0,
            }}
          />
        ))}
      </AnimatePresence>

      <div className="glass-panel mobile-card luigi-card">
        <div className="card-header">
          <h1 className="title-mobile">LUIGI</h1>
          <p className="subtitle">"Fromagio de zigounetti..."</p>
        </div>

        <button className="btn-primary luigi-btn" onClick={handleDistribute}>
          <Leaf size={24} className="btn-icon" />
          <span>Distribuer Bédos</span>
          <span className="price-tag">-50k 🟡</span>
        </button>

        <div className="divider"></div>

        <button
          className={`btn-secondary vacuum-btn ${cleaning ? 'cleaning' : ''}`}
          onClick={handleClean}
        >
          <Wind size={24} className="btn-icon" />
          <span>{cleaning ? "Nettoyage..." : "Aspirer Notifs"}</span>
        </button>
      </div>

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

        .smoke-particle {
          position: absolute;
          bottom: 20%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(150,255,150,0.8) 0%, rgba(57,255,20,0.2) 50%, transparent 80%);
          filter: blur(10px);
          pointer-events: none;
          z-index: 5;
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

        /* Boutons Premium Tactiles */
        .btn-primary {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 18px 20px;
          border-radius: 20px;
          border: none;
          font-size: 1.1rem;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.15s, filter 0.2s;
        }

        .btn-primary:active {
          transform: scale(0.96);
          filter: brightness(0.8);
        }

        .luigi-btn {
          background: var(--theme-color);
          color: #002200;
          justify-content: space-between;
          box-shadow: 0 5px 15px rgba(57, 255, 20, 0.3);
        }

        .btn-icon {
          margin-right: 15px;
        }

        .price-tag {
          font-size: 0.8rem;
          background: rgba(0,0,0,0.2);
          padding: 5px 10px;
          border-radius: 10px;
        }

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
