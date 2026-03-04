import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Heart, ShieldAlert, Sparkles, X } from 'lucide-react';
import useStore from '../store/useStore';
import { socket } from '../socket';

export default function PagePeach() {
  const { username, activeUsers, spendCoins } = useStore();
  const [bblAlert, setBblAlert] = useState(false);
  const [bblClicks, setBblClicks] = useState(0);

  // Simulation d'un événement aléatoire BBL Balloon
  React.useEffect(() => {
    const timer = setTimeout(() => setBblAlert(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleDefend = () => {
    if (window.navigator?.vibrate) window.navigator.vibrate(20); // Léger Taptic
    setBblClicks(c => c + 1);
    if (bblClicks >= 4) {
      if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100]); // Succès
      setBblAlert(false);
      setBblClicks(0);
    }
  };


  return (
    <motion.div
      className="page-mobile peach-mobile"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <div className="peach-ambient"></div>

      <div className="glass-panel mobile-card peach-card">
        <div className="profile-header">
          <div className="avatar glow-avatar">👑</div>
          <div className="titles">
            <h1 className="title-mobile peach-title">PEACHASSE</h1>
            <p className="only-fans-tag">💎 Top 0.01% Mushroom Kingdom</p>
          </div>
        </div>

        <div className="leaks-scroll-area">
          <div className="leak-card" onClick={() => spendCoins(999999, 'LEAK PRIVÉ PEACH')}>
            <div className="card-bg soft-blur"></div>
            <Lock className="lock-icon" size={32} />
            <span className="unlock-text">Débloquer Content</span>
            <span className="price-tag gold">999k 🟡</span>
          </div>

          <div className="leak-card" onClick={() => spendCoins(5000000, 'LEAK VIP PEACH')}>
            <div className="card-bg heavy-blur"></div>
            <Lock className="lock-icon" size={32} color="#ffaa00" />
            <span className="unlock-text">👑 VIP Only</span>
            <span className="price-tag gold">5M 🟡</span>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {bblAlert && (
          <motion.div
            className="bbl-popup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-panel bbl-popup"
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100 }}
              onClick={handleDefend}
            >
              <ShieldAlert size={48} color="white" />
              <h2>ALERTE BBL BALLOON</h2>
              <p>Maintient Peach en sécurité !<br />Tapote vite ({bblClicks}/5)</p>
              <div className="balloons-anim">🎈 🍑 🎈</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .peach-mobile {
          --theme-color: #ff00ff;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
        }

        .peach-ambient {
          position: absolute;
          top: -30%; left: -30%; right: -30%; bottom: -30%;
          background: radial-gradient(circle at center, rgba(255, 0, 255, 0.15) 0%, transparent 60%);
          z-index: -1;
        }

        .peach-card {
          width: 100%;
          padding: 25px 20px;
          border-radius: 32px;
          border-color: rgba(255, 0, 255, 0.3);
          background: rgba(20, 0, 20, 0.6);
          box-shadow: 0 10px 40px rgba(50, 0, 50, 0.5);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .avatar.glow-avatar {
          font-size: 3.5rem;
          background: linear-gradient(135deg, #ff00ff, #ffaa00);
          border-radius: 50%;
          width: 80px; height: 80px;
          display: flex; justify-content: center; align-items: center;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
        }

        .titles { display: flex; flex-direction: column; }

        .peach-title {
          font-size: 1.8rem;
          color: white;
          text-shadow: 0 0 10px var(--theme-color);
          margin-bottom: 2px;
        }

        .only-fans-tag {
          color: #ffbbee;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* Liste de scroll horizontal iOS */
        .leaks-scroll-area {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 10px;
          /* Masque scrollbar */
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .leaks-scroll-area::-webkit-scrollbar { display: none; }

        .leak-card {
          flex: 0 0 85%;
          height: 200px;
          border-radius: 20px;
          background: rgba(0,0,0,0.5);
          border: 1px solid rgba(255, 0, 255, 0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          scroll-snap-align: center;
          cursor: pointer;
        }

        .card-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,0,255,0.05) 10px, rgba(255,0,255,0.05) 20px);
          z-index: 0;
        }

        .lock-icon {
          z-index: 1;
          margin-bottom: 10px;
        }

        .unlock-text {
          z-index: 1;
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 10px;
        }

        .price-tag.gold {
          z-index: 1;
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
          padding: 5px 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 170, 0, 0.5);
        }

        .bbl-popup-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(255, 0, 50, 0.4);
          z-index: 150;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
        }

        .bbl-popup {
          background: #ff0044;
          width: 85%;
          text-align: center;
          padding: 40px 20px;
          border-radius: 30px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          cursor: pointer;
        }
        
        .bbl-popup h2 { font-size: 1.5rem; margin-top: 15px; }
        .balloons-anim { font-size: 3rem; margin-top: 20px; animation: bounce 0.5s infinite alternate; }

        @keyframes bounce {
          from { transform: translateY(0px) scale(0.9); }
          to { transform: translateY(-10px) scale(1.1); }
        }

        /* MASSAGE MODAL UI */
        .massage-modal-overlay {
          position: absolute; top:0; left:0; width:100%; height:100%;
          background: rgba(0,0,0,0.8); z-index: 100;
          display: flex; align-items: center; justify-content: center;
          padding: 20px; backdrop-filter: blur(10px);
        }
        
        .massage-modal {
          width: 100%;
          background: rgba(30, 0, 30, 0.9);
          border: 1px solid #ff00ff;
          padding: 25px;
        }

        .modal-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 25px; border-bottom: 1px solid rgba(255,0,255,0.3);
          padding-bottom: 15px; color: white;
        }

        .modal-header h2 { font-size: 1.4rem; color: #ffbbee; text-transform: uppercase; letter-spacing: 1px;}
        .close-btn { background: transparent; border: none; color: #ffbbee; }

        .form-group { margin-bottom: 25px; display: flex; flex-direction: column; gap: 10px;}
        .form-group label { color: #ffbbee; font-weight: bold; }

        .custom-select {
          background: rgba(0,0,0,0.5); border: 1px solid #ff00ff;
          color: white; padding: 12px; border-radius: 12px;
          font-size: 1.1rem; appearance: none;
        }

        .slider-labels { display: flex; justify-content: space-between; font-size: 0.9rem; color: #aaa; margin-bottom: 5px; }
        
        /* Custom Slider */
        .custom-slider {
          -webkit-appearance: none; width: 100%; background: transparent;
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none; height: 25px; width: 25px; border-radius: 50%;
          background: #ff00ff; cursor: pointer; box-shadow: 0 0 10px #ff00ff;
          margin-top: -10px;
        }
        .custom-slider::-webkit-slider-runnable-track {
          width: 100%; height: 5px; cursor: pointer;
          background: linear-gradient(to right, #00ffff, #ff00ff, #ff0000);
          border-radius: 5px;
        }

        .confirm-massage-btn {
          width: 100%; margin-top: 10px; background: linear-gradient(90deg, #ff00ff, #ff0055);
          display: flex; justify-content: center; align-items: center; gap: 10px;
          font-weight: bold; font-size: 1.1rem; padding: 15px; border-radius: 15px;
        }

        /* PREMIUM VIP MASSAGE BUTTON */
        .massage-btn {
          width: 100%; margin-top: 25px;
          background: linear-gradient(135deg, #ff00ff 0%, #aa00aa 50%, #440044 100%);
          border: 2px solid #ffbbee;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2);
          color: white; font-weight: 900; font-size: 1.15rem;
          padding: 18px; border-radius: 20px;
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .massage-btn .btn-icon { color: #ffbbee; filter: drop-shadow(0 0 5px white); }
        .massage-btn small { font-size: 0.8rem; opacity: 0.8; text-transform: none; }

        .shine-effect::before {
          content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
          transform: skewX(-20deg); animation: shine 3s infinite;
        }
        @keyframes shine {
          0% { left: -100%; }
          20% { left: 200%; }
          100% { left: 200%; }
        }
      `}</style>
    </motion.div >
  );
}
