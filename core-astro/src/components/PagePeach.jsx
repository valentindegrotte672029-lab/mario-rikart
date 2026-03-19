import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldAlert, X, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { socket } from '../socket';
import NeonIcon from './NeonIcon';
import ComingSoon from './ComingSoon';

// All 26 photos
const ALL_PHOTOS = Array.from({ length: 26 }, (_, i) => `/images/peach/peach-${i + 1}.jpg`);

// The 10 photos included in the basic pack (fixed set for everyone)
const BASIC_PHOTOS = [1, 3, 5, 7, 9, 11, 14, 17, 20, 23].map(n => `/images/peach/peach-${n}.jpg`);

export default function PagePeach() {
  const { spendCoins, peachUnlock, setPeachUnlock, featureFlags } = useStore();
  const [bblAlert, setBblAlert] = useState(false);
  const [bblClicks, setBblClicks] = useState(0);
  const [viewerIndex, setViewerIndex] = useState(null);
  const setPage = useStore(s => s.setPage);

  const CategoryTabBar = () => (
    <div className="category-tab-bar">
      <button className="category-tab active" onClick={() => setPage('PEACH')}>
        <NeonIcon name="rikart-peachasse-icon" size={18} /> PEACH
      </button>
      <button className="category-tab" onClick={() => setPage('TROMBI')}>
        <NeonIcon name="Trombi icône" size={18} /> TROMBI
      </button>
    </div>
  );

  const visiblePhotos = peachUnlock === 'vip' ? ALL_PHOTOS : peachUnlock === 'basic' ? BASIC_PHOTOS : [];

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
    if (success) {
      setPeachUnlock('basic');
      socket.emit('peach_purchase', { username: useStore.getState().username, level: 'basic' });
    }
  };

  const handleUnlockVip = () => {
    const success = spendCoins(2000, 'LEAK VIP PEACH');
    if (success) {
      setPeachUnlock('vip');
      socket.emit('peach_purchase', { username: useStore.getState().username, level: 'vip' });
    }
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
      <CategoryTabBar />
      <div className="glass-panel mobile-card peach-card">
          {!featureFlags.peachasse ? (
            <ComingSoon title="Peachasse Lux" icon="rikart-peachasse-icon" color="#ff00ff" />
          ) : (
            <>
              <div className="profile-header">
            <div className="avatar glow-avatar"><NeonIcon name="rikart-peachasse-icon" size={50} /></div>
            <div className="titles">
              <h1 className="title-mobile peach-title">PEACHASSE</h1>
              <p className="only-fans-tag"><NeonIcon name="star-mushroom-indigo" size={16} /> Top 0.01% Mushroom Kingdom</p>
              {peachUnlock === 'vip' && <p className="vip-badge"><NeonIcon name="peach-crown" size={14} /> VIP — 26 photos</p>}
              {peachUnlock === 'basic' && <p className="basic-badge"><NeonIcon name="lock-neon" size={14} /> Basic — 10 photos</p>}
            </div>
          </div>

          {/* Unlock cards when not yet purchased */}
          {peachUnlock === 'none' && (
            <div className="subscription-tiers">
              <h3 className="tiers-title">Abonnements Disponibles</h3>

              <div className="tier-card basic-tier" onClick={handleUnlockBasic}>
                <div className="tier-header">
                  <span className="tier-name"><Lock size={18} /> Pack Découverte</span>
                  <span className="price-tag gold">500 <NeonIcon name="coin-gold" size={14} /></span>
                </div>
                <ul className="tier-features">
                  <li><NeonIcon name="fire-flower-pixel" size={14} /> 10 photos aléatoires</li>
                  <li><NeonIcon name="lock-neon" size={14} /> Accès basique au feed</li>
                </ul>
                <button className="btn-subscribe basic">S'abonner</button>
              </div>

              <div className="tier-card vip-tier" onClick={handleUnlockVip}>
                <div className="tier-badge">RECOMMANDÉ</div>
                <div className="tier-header">
                  <span className="tier-name"><NeonIcon name="peach-crown" size={18} /> Pack Full VIP</span>
                  <span className="price-tag gold">2000 <NeonIcon name="coin-gold" size={14} /></span>
                </div>
                <ul className="tier-features">
                  <li><Crown size={14} color="#ffaa00" /> Les 26 photos complètes</li>
                  <li><NeonIcon name="star-mushroom-indigo" size={14} /> Contenu exclusif non censuré</li>
                </ul>
                <button className="btn-subscribe vip">Débloquer VIP</button>
              </div>
            </div>
          )}

          {/* Upgrade to VIP when basic is unlocked */}
          {peachUnlock === 'basic' && (
            <div className="upgrade-banner" onClick={handleUnlockVip}>
              <Crown size={20} color="#ffaa00" />
              <span>Passer VIP — voir les 26 photos</span>
              <span className="price-tag gold small">2000 <NeonIcon name="coin-gold" size={14} /></span>
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
            </>
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
              <div className="balloons-anim"><NeonIcon name="bbl-popup" size={48} /></div>
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

        .category-tab-bar {
          display: flex;
          width: 100%;
          max-width: 450px;
          gap: 10px;
          margin-bottom: 15px;
          padding: 0 5px;
          z-index: 100;
        }
        .category-tab {
          flex: 1;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 15px;
          padding: 12px;
          color: #aaa;
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .category-tab.active {
          background: rgba(255, 0, 255, 0.2) !important;
          border-color: #ff00ff !important;
          color: white;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.3);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .avatar.glow-avatar {
          font-size: 3.5rem;
          background: transparent;
          border-radius: 0;
          width: 120px; height: 120px;
          display: flex; justify-content: center; align-items: center;
          box-shadow: none;
          filter: drop-shadow(0 0 12px rgba(255, 0, 255, 0.6)) drop-shadow(0 0 25px rgba(255, 170, 0, 0.3));
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }

        .vip-badge {
          color: #ffaa00;
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
        }

        .basic-badge {
          color: #ff88dd;
          font-size: 0.8rem;
          font-weight: 700;
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        /* Subscription tiers overlay */
        .subscription-tiers {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 10px;
          margin-bottom: 20px;
        }

        .tiers-title {
          color: white;
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
          text-align: center;
        }

        .tier-card {
          background: rgba(40, 0, 40, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .tier-card:active {
          transform: scale(0.98);
        }

        .tier-card.basic-tier {
          border-left: 4px solid #aaa;
        }

        .tier-card.vip-tier {
          background: rgba(255, 0, 255, 0.1);
          border: 1px solid rgba(255, 0, 255, 0.4);
          border-left: 4px solid #ff00ff;
          box-shadow: 0 5px 20px rgba(255, 0, 255, 0.2);
        }

        .tier-badge {
          position: absolute;
          top: -10px; right: 15px;
          background: #ff00ff;
          color: white;
          font-size: 0.75rem;
          font-weight: 900;
          padding: 3px 10px;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.6);
          letter-spacing: 1px;
        }

        .tier-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }

        .tier-name {
          font-size: 1.2rem;
          font-weight: 900;
          color: white;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vip-tier .tier-name {
          color: #ffaa00;
          text-shadow: 0 0 10px rgba(255, 170, 0, 0.5);
        }

        .tier-features {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tier-features li {
          font-size: 0.85rem;
          color: #ccc;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .vip-tier .tier-features li {
          color: #fff;
        }

        .btn-subscribe {
          margin-top: 10px;
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: none;
          font-weight: 900;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
        }

        .btn-subscribe.basic {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .btn-subscribe.vip {
          background: linear-gradient(90deg, #ff00ff, #ff0088);
          color: white;
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        }

        .price-tag.gold {
          background: rgba(255, 170, 0, 0.1);
          border: 1px solid rgba(255, 170, 0, 0.3);
          color: #ffaa00;
          padding: 4px 10px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: bold;
        }
        .price-tag.gold.small { padding: 3px 8px; font-size: 0.85rem; }

        /* Upgrade banner */
        .upgrade-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: transparent !important;
          border: none !important;
          border-radius: 0;
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
          border: none !important;
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
        .balloons-anim { font-size: 3rem; margin-top: 20px; animation: bounce 0.5s infinite alternate; display: flex; align-items: center; justify-content: center; }

        @keyframes bounce {
          from { transform: translateY(0px) scale(0.9); }
          to { transform: translateY(-10px) scale(1.1); }
        }
      `}</style>
    </motion.div>
  );
}
