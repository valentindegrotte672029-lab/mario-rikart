import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Citrus } from 'lucide-react';

export default function PageMario() {
  const [bunnies, setBunnies] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [oranges, setOranges] = useState([]);
  const [shake, setShake] = useState(false);

  const handleChubbyBunny = () => {
    setBunnies(b => b + 1);

    // Haptic feedback intense
    if (window.navigator?.vibrate) window.navigator.vibrate([40, 20, 60]);

    // Animation de secousse de la carte
    setShake(true);
    setTimeout(() => setShake(false), 150);

    // Pop graphique d'une clémentine
    const newOrange = {
      id: Date.now(),
      x: (Math.random() - 0.5) * 150, // De -75px à +75px en X
      y: - (Math.random() * 100 + 50), // De -50px à -150px en Y
      rot: Math.random() * 180 - 90, // Rotation aléatoire
    };
    setOranges(prev => [...prev, newOrange]);

    // Nettoyage de la clémentine visuelle
    setTimeout(() => {
      setOranges(prev => prev.filter(o => o.id !== newOrange.id));
    }, 1000); // 1 seconde de durée de vie
  };

  return (
    <motion.div
      className="page-mobile mario-mobile float-subtle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
    >
      <div className="tears-overlay"></div>

      <div className={`glass-panel mobile-card mario-card ${shake ? 'mario-shake' : ''}`}>
        <h1 className="title-mobile mario-title">G O U M I N</h1>
        <p className="subtitle sad-subtitle">L'amour rend triste...</p>

        <div className="challenge-container">
          <h3>Challenge Chubby Bunny</h3>
          <p className="desc">Combien de clémentines pour oublier Peach ?</p>

          <div className="score-display">
            <motion.span
              key={bunnies}
              initial={{ scale: 1.5, color: '#ffcc00' }}
              animate={{ scale: 1, color: '#ffa500' }}
              transition={{ type: 'spring', stiffness: 500, damping: 10 }}
            >
              🍊 {bunnies}
            </motion.span>
          </div>

          <div className="btn-wrapper" style={{ position: 'relative' }}>
            {/* Particules clémentines (émojis) */}
            <AnimatePresence>
              {oranges.map(orange => (
                <motion.div
                  key={orange.id}
                  initial={{ opacity: 1, scale: 0.5, x: 0, y: 0, rotate: 0 }}
                  animate={{ opacity: 0, scale: 1.5, x: orange.x, y: orange.y, rotate: orange.rot }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{
                    position: 'absolute',
                    top: '20%',
                    left: '40%',
                    fontSize: '3rem',
                    pointerEvents: 'none',
                    zIndex: 20
                  }}
                >
                  🍊
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              className={`huge-btn ${isPressing ? 'pressed' : ''}`}
              onPointerDown={() => setIsPressing(true)}
              onPointerUp={() => { setIsPressing(false); handleChubbyBunny(); }}
              onPointerLeave={() => setIsPressing(false)}
            >
              <Citrus size={40} className="icon-center" />
              <span>ENGLOUTIR</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .mario-mobile {
          --theme-color: #aa0000;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
          filter: contrast(1.1) saturate(0.8) sepia(0.2);
        }

        .tears-overlay {
          position: absolute;
          top: -20%; left: -20%; right: -20%; bottom: -20%;
          background: radial-gradient(circle at top, rgba(150, 0, 0, 0.4), transparent 70%);
          z-index: -1;
        }

        .mario-card {
          width: 100%;
          padding: 30px 20px;
          border-radius: 32px;
          border-color: rgba(255, 0, 0, 0.2);
          background: rgba(30, 0, 0, 0.7);
          box-shadow: 0 10px 40px rgba(50, 0, 0, 0.8);
          text-align: center;
          transition: transform 0.05s;
        }

        .mario-shake {
           transform: translate(5px, 8px) rotate(-1deg);
        }

        .mario-title {
          font-size: 2.8rem;
          color: #ff3333;
          letter-spacing: 2px;
          font-weight: 300;
        }

        .sad-subtitle {
          color: #ff9999;
          font-style: italic;
          margin-bottom: 30px;
        }

        .challenge-container {
          background: rgba(0,0,0,0.4);
          padding: 25px 20px;
          border-radius: 24px;
        }

        .challenge-container h3 {
          font-size: 1.2rem;
          color: white;
          margin-bottom: 5px;
        }

        .desc {
          font-size: 0.85rem;
          color: #aaa;
          margin-bottom: 25px;
        }

        .score-display {
          font-size: 4rem;
          font-weight: 900;
          color: orange;
          margin-bottom: 25px;
          text-shadow: 0 0 30px rgba(255, 165, 0, 0.6);
          display: flex; justify-content: center; align-items: center;
        }

        .huge-btn {
          width: 100%;
          aspect-ratio: 2 / 1;
          background: linear-gradient(135deg, #ff5500, #aa3300);
          border: none;
          border-radius: 30px;
          color: white;
          font-weight: 900;
          font-size: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 0 #662200;
          transition: all 0.1s;
          /* Supprime le highlight bleu iOS */
          -webkit-tap-highlight-color: transparent;
        }

        .huge-btn.pressed {
          transform: translateY(10px);
          box-shadow: 0 0px 0 #662200;
          background: linear-gradient(135deg, #dd4400, #992200);
        }
      `}</style>
    </motion.div>
  );
}
