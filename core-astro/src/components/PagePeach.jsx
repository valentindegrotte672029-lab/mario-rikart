import React, { useState, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, X, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';

// All 26 photos
const ALL_PHOTOS = Array.from({ length: 26 }, (_, i) => `/images/peach/peach-${i + 1}.jpg`);

function shuffleAndPick(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function PagePeach() {
  const { spendCoins, peachUnlock, setPeachUnlock } = useStore();
  const [bblAlert, setBblAlert] = useState(false);
  const [bblClicks, setBblClicks] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(null);

  // Pick 10 random photos for basic unlock (stable per session)
  const basicPhotos = useMemo(() => shuffleAndPick(ALL_PHOTOS, 10), []);

  const visiblePhotos = peachUnlock === 'vip' ? ALL_PHOTOS : peachUnlock === 'basic' ? basicPhotos : [];

  React.useEffect(() => {
    const timer = setTimeout(() => setBblAlert(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleDefend = () => {
    if (window.navigator?.vibrate) window.navigator.vibrate(20);
    setBblClicks(c => c + 1);
    if (bblClicks >= 4) {
      if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100]);
      setBblAlert(false);
      setBblClicks(0);
    }
  };

  const handleUnlockBasic = () => {
    if (peachUnlock !== 'none') return;
    const success = spendCoins(500, 'LEAK PRIVÉ PEACH');
    if (success) setPeachUnlock('basic');
  };

  const handleUnlockVip = () => {
    const success = spendCoins(2000, 'LEAK VIP PEACH');
    if (success) setPeachUnlock('vip');
  };

  const openViewer = (idx) => setViewerIndex(idx);
  const closeViewer = () => setViewerIndex(null);
  const prevPhoto = () => setViewerIndex(i => (i > 0 ? i - 1 : visiblePhotos.length - 1));
  const nextPhoto = () => setViewerIndex(i => (i < visiblePhotos.length - 1 ? i + 1 : 0));

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
              {peachUnlock === 'vip' && <p className="vip-badge">👑 VIP — 26 photos</p>}
              {peachUnlock === 'basic' && <p className="basic-badge">🔓 Basic — 10 photos</p>}
            </div>
          </div>

          {/* Unlock cards when not yet purchased */}
          {peachUnlock === 'none' && (
            <div className="leaks-scroll-area">
              <div className="leak-card" onClick={handleUnlockBasic}>
                <div className="card-bg soft-blur"></div>
                <Lock className="lock-icon" size={32} />
                <span className="unlock-text">Débloquer Contenu</span>
                <span className="unlock-sub">10 photos aléatoires 🔥</span>
                <span className="price-tag gold">500 🟡</span>
              </div>

              <div className="leak-card vip-card" onClick={handleUnlockVip}>
                <div className="card-bg heavy-blur"></div>
                <Crown className="lock-icon" size={32} color="#ffaa00" />
                <span className="unlock-text">👑 VIP Only</span>
                <span className="unlock-sub">Les 26 photos complètes 💎</span>
                <span className="price-tag gold">2000 🟡</span>
              </div>
            </div>
          )}

          {/* Upgrade to VIP when basic is unlocked */}
          {peachUnlock === 'basic' && (
            <div className="upgrade-banner" onClick={handleUnlockVip}>
              <Crown size={20} color="#ffaa00" />
              <span>Passer VIP — voir les 26 photos</span>
              <span className="price-tag gold small">2000 🟡</span>
            </div>
          )}

          {/* Photo grid */}
          {peachUnlock !== 'none' && (
            <div className="peach-photo-grid">
              {visiblePhotos.map((src, idx) => (
                <motion.div
                  key={src}
                  className="peach-thumb"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => openViewer(idx)}
                >
                  <img src={src} alt={`Peach ${idx + 1}`} loading="lazy" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

      {/* Fullscreen photo viewer */}
      <AnimatePresence>
        {viewerIndex !== null && (
          <motion.div
            className="photo-viewer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeViewer}
          >
            <button className="viewer-close" onClick={closeViewer}><X size={28} /></button>
            <button className="viewer-nav viewer-prev" onClick={(e) => { e.stopPropagation(); prevPhoto(); }}><ChevronLeft size={36} /></button>
            <motion.img
              key={visiblePhotos[viewerIndex]}
              className="viewer-img"
              src={visiblePhotos[viewerIndex]}
              alt="Peach fullscreen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />
            <button className="viewer-nav viewer-next" onClick={(e) => { e.stopPropagation(); nextPhoto(); }}><ChevronRight size={36} /></button>
            <div className="viewer-counter">{viewerIndex + 1} / {visiblePhotos.length}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BBL Alert */}
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
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .peach-ambient {
          position: absolute;
          top: -30%; left: -30%; right: -30%; bottom: -30%;
          background: radial-gradient(circle at center, rgba(255, 0, 255, 0.15) 0%, transparent 60%);
          z-index: -1;
          pointer-events: none;
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
          margin-bottom: 20px;
        }

        .avatar.glow-avatar {
          font-size: 3.5rem;
          background: linear-gradient(135deg, #ff00ff, #ffaa00);
          border-radius: 50%;
          width: 80px; height: 80px;
          display: flex; justify-content: center; align-items: center;
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
          flex-shrink: 0;
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

        .vip-badge {
          color: #ffaa00;
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 4px;
        }

        .basic-badge {
          color: #ff88dd;
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 4px;
        }

        /* Unlock cards scroll */
        .leaks-scroll-area {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 10px;
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
          gap: 6px;
        }

        .leak-card.vip-card {
          border-color: rgba(255, 170, 0, 0.4);
          background: rgba(40, 20, 0, 0.5);
        }

        .card-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,0,255,0.05) 10px, rgba(255,0,255,0.05) 20px);
          z-index: 0;
        }

        .lock-icon { z-index: 1; }
        .unlock-text { z-index: 1; font-weight: bold; font-size: 1.1rem; }
        .unlock-sub { z-index: 1; font-size: 0.8rem; color: #ccc; }

        .price-tag.gold {
          z-index: 1;
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
          padding: 5px 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 170, 0, 0.5);
        }
        .price-tag.gold.small { padding: 3px 10px; font-size: 0.85rem; }

        /* Upgrade banner */
        .upgrade-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: linear-gradient(90deg, rgba(255,170,0,0.15), rgba(255,0,255,0.15));
          border: 1px solid rgba(255, 170, 0, 0.4);
          border-radius: 16px;
          padding: 12px 15px;
          margin-bottom: 15px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffcc66;
        }

        /* Photo grid */
        .peach-photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-top: 10px;
        }

        .peach-thumb {
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255, 0, 255, 0.2);
        }

        .peach-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Fullscreen viewer */
        .photo-viewer-overlay {
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .viewer-img {
          max-width: 90vw;
          max-height: 85vh;
          object-fit: contain;
          border-radius: 12px;
          user-select: none;
          -webkit-user-drag: none;
        }

        .viewer-close {
          position: absolute;
          top: 20px; right: 20px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          border-radius: 50%;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          z-index: 10;
        }

        .viewer-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          border-radius: 50%;
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          z-index: 10;
        }
        .viewer-prev { left: 10px; }
        .viewer-next { right: 10px; }

        .viewer-counter {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          font-weight: 600;
          background: rgba(0,0,0,0.5);
          padding: 4px 14px;
          border-radius: 20px;
        }

        /* BBL Alert */
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
      `}</style>
    </motion.div>
  );
}
