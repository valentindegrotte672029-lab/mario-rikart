/* eslint-disable */
import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import useStore from '../store/useStore';
import { socket } from '../socket';
import NeonIcon from './NeonIcon';

const generateQr = () => `WLU-${Math.random().toString(36).substring(7).toUpperCase()}`;

export default function PageWaluigi() {
  const { spendCoins, setBgOverride, clearBgOverride, setPage } = useStore();
  const [orderQr, setOrderQr] = useState(null);

  const CategoryTabBar = () => (
    <div className="category-tab-bar">
      <button className="category-tab active" onClick={() => setPage('WALUIGI')}>
        <NeonIcon name="Waluigi icône" size={18} style={{ transform: 'scaleX(1.15)' }} /> BAR
      </button>
      <button className="category-tab" onClick={() => setPage('PSYCH')}>
        <NeonIcon name="Test icône" size={18} /> TEST
      </button>
    </div>
  );

  const menu = [
    { id: 'gourd-50', name: 'Gourdasse 50cc', price: 15000, icon: 'flask-purple-atomic' },
    { id: 'gourd-100', name: 'Gourdasse 100cc', price: 30000, icon: 'flask-orange-distill' },
    { id: 'gourd-150', name: 'Gourdasse 150cc', price: 60000, icon: 'flask-green-erlenmeyer' },
  ];

  const handleBuy = (item) => {
    const success = spendCoins(item.price, item.name.toUpperCase());
    if (!success) {
      if (window.navigator?.vibrate) window.navigator.vibrate(200);
      return;
    }
    if (window.navigator?.vibrate) window.navigator.vibrate([30, 50, 30]);

    // Emission Websocket au panel Admin
    socket.emit('new_order', { item: item.name, price: item.price, id: item.id });

    // Génération mock de QR Code
    setOrderQr(`WLU - ${Math.random().toString(36).substring(7).toUpperCase()} `);
  };

  return (
    <motion.div
      className="page-mobile waluigi-mobile"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
    >
      <CategoryTabBar />
      <div className="glass-panel mobile-card waluigi-card">
        <h1 className="title-mobile waluigi-title">WALUIGI-BARNAQUE</h1>
        <p className="waluigi-motto">"Tu vas raquer, c'est WALUIGI TIME !"</p>

        {/* Liste iOS Native Style */}
        <div className="ios-list">
          {menu.map((item, index) => (
            <div key={item.id} className="ios-list-item" onClick={() => handleBuy(item)}>
              <div className="item-icon-circle"><NeonIcon name={item.icon} size={30} /></div>
              <div className="item-details">
                <h4>{item.name}</h4>
                <p className="waluigi-price-tag">{item.price} <NeonIcon name="coin-gold" size={18} /></p>
              </div>
              <ChevronRight size={20} color="#9900ff" className="chevron" />
              {index !== menu.length - 1 && <div className="ios-separator"></div>}
            </div>
          ))}
        </div>

        {/* Modal QR Code */}
        <AnimatePresence>
          {orderQr && (
            <motion.div
              className="qr-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderQr(null)}
            >
              <div className="qr-modal-box" onClick={(e) => e.stopPropagation()}>
                <div style={{ marginBottom: '10px' }}><NeonIcon name="ticket-gold" size={100} glow="#9900ff" /></div>
                <h3>Commande Validée</h3>
                <div className="qr-code-text">{orderQr}</div>
                <p>Présente ce code au barman.</p>
                <button className="qr-close-btn" onClick={() => setOrderQr(null)}>
                  Fermer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .waluigi-mobile {
          --theme-color: #9900ff;
          --accent-yellow: #ffcc00;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
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
          background: rgba(153, 0, 255, 0.2) !important;
          border-color: #9900ff !important;
          color: white;
          box-shadow: 0 0 15px rgba(153, 0, 255, 0.3);
        }

        .waluigi-card {
          width: 100%;
          border-radius: 32px;
          border-color: rgba(153, 0, 255, 0.4);
          background: rgba(15, 0, 25, 0.9);
          box-shadow: 0 0 40px rgba(153, 0, 255, 0.1), inset 0 0 20px rgba(255, 204, 0, 0.05);
          display: flex;
          flex-direction: column;
        }

        .waluigi-title {
          color: var(--theme-color);
          font-size: 1.8rem;
          text-align: center;
          margin-top: 25px;
          font-weight: 900;
          letter-spacing: 1px;
          text-shadow: 0 0 15px rgba(153, 0, 255, 0.4);
        }

        .waluigi-motto {
          text-align: center;
          font-style: italic;
          color: #ff88dd;
          font-size: 0.85rem;
          margin-bottom: 20px;
          text-shadow: 0 0 5px rgba(255, 136, 221, 0.5);
        }

        .ios-list {
          flex: 1;
          background: transparent !important;
          border-radius: 0;
          margin: 0 15px 15px 15px;
          box-shadow: none !important;
          border: none !important;
          overflow-y: auto;
        }
        .ios-list::-webkit-scrollbar { display: none; }

        .ios-list-item {
          display: flex;
          align-items: center;
          padding: 18px 20px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .ios-list-item:active {
          background: rgba(153, 0, 255, 0.1) !important;
          transform: scale(0.98);
        }

        .item-icon-circle {
          width: 65px; height: 65px;
          background: transparent;
          border-radius: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem;
          margin-right: 15px;
          border: none;
          box-shadow: none;
          flex-shrink: 0;
        }

        .item-details { flex: 1; }
        .item-details h4 { font-size: 0.95rem; color: white; margin-bottom: 3px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .waluigi-price-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: transparent;
          border: none;
          color: var(--accent-yellow); font-weight: 900;
          padding: 3px 0; border-radius: 0;
          font-size: 0.9rem;
          text-shadow: 0 0 8px rgba(255, 204, 0, 0.6);
          filter: drop-shadow(0 0 6px rgba(255, 204, 0, 0.3));
          margin-top: 4px;
        }

        .chevron { opacity: 0.8; color: var(--theme-color); }

        .ios-separator {
          position: absolute;
          bottom: 0; right: 0;
          width: calc(100% - 80px);
          height: 1px;
          background: rgba(153, 0, 255, 0.15);
        }

        .qr-modal-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
        }

        .qr-modal-box {
          background: transparent !important;
          color: white;
          width: 80%;
          border-radius: 0;
          padding: 30px 20px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          box-shadow: none !important;
          border: none !important;
        }

        .qr-modal-box h3 { margin-top: 15px; font-size: 1.3rem; font-weight: 900; color: #9900ff; text-shadow: 0 0 15px rgba(153, 0, 255, 0.6); }
        
        .qr-code-text {
          font-family: monospace;
          background: transparent !important;
          color: var(--theme-color);
          padding: 10px 20px;
          border-radius: 0;
          font-size: 1.2rem;
          letter-spacing: 2px;
          margin: 15px 0;
          font-weight: bold;
          border: none !important;
          text-shadow: 0 0 10px rgba(153, 0, 255, 0.8);
        }

        .qr-modal-box p { color: #ccc; font-size: 0.9rem; margin-bottom: 25px; font-weight: bold; text-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }

        .qr-close-btn { background: rgba(153, 0, 255, 0.2) !important; border: 1px solid #9900ff !important; color: white; font-weight: bold; padding: 12px 30px; border-radius: 12px; font-size: 1rem; width: 100%; cursor: pointer; text-shadow: 0 0 5px rgba(255,255,255,0.5); }
      `}</style>
    </motion.div>
  );
}
