import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronRight, QrCode } from 'lucide-react';
import useStore from '../store/useStore';
import { socket } from '../socket';

export default function PageWario() {
  const { spendCoins } = useStore();
  const [orderQr, setOrderQr] = useState(null);

  const menu = [
    { id: 'ricard', name: 'Gourdasse 50cc (Ricard/Eau)', price: 50, icon: '🥃' },
    { id: 'vodka', name: 'Gourdasse 100cc (Vodka/Redbull)', price: 100, icon: '🍹' },
    { id: 'destruct', name: 'Gourdasse 200cc (Destruction)', price: 200, icon: '☠️' },
    { id: 'pizza', name: 'Pizza 4 Formaggio', price: 120, icon: '🍕' },
    { id: 'spacecake', name: 'Space Cake Étoile', price: 150, icon: '⭐' },
  ];

  const handleBuy = (item) => {
    spendCoins(item.price * 1000, item.name.toUpperCase());
    if (window.navigator?.vibrate) window.navigator.vibrate([30, 50, 30]);

    // Emission Websocket au panel Admin
    socket.emit('new_order', { item: item.name, price: item.price * 1000, id: item.id });

    // Génération mock de QR Code
    setOrderQr(`WRO-${Math.random().toString(36).substring(7).toUpperCase()}`);
  };

  return (
    <motion.div
      className="page-mobile wario-mobile"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
    >
      <div className="glass-panel mobile-card wario-card">
        <h1 className="title-mobile wario-title">WARIO-BARNAQUE</h1>
        <p className="wario-motto">"Même pour un verre d'eau, tu raques."</p>

        {/* Liste iOS Native Style */}
        <div className="ios-list">
          {menu.map((item, index) => (
            <div key={item.id} className="ios-list-item" onClick={() => handleBuy(item)}>
              <div className="item-icon-circle">{item.icon}</div>
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>{item.price}k 🟡</p>
              </div>
              <ChevronRight size={20} color="#666" className="chevron" />
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
                <QrCode size={100} color="black" />
                <h3>Commande Validée</h3>
                <div className="qr-code-text">{orderQr}</div>
                <p>Présente ce code au barman.</p>
                <button className="qr-close-btn" onClick={() => setOrderQr(null)}>Fermer</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .wario-mobile {
          --theme-color: #ffcc00;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          /* S'adapte au container content-area qui fixe la heigh max */
        }

        .wario-card {
          flex: 1;
          width: 100%;
          border-radius: 32px;
          border-color: rgba(255, 204, 0, 0.3);
          background: rgba(40, 30, 0, 0.75);
          display: flex;
          flex-direction: column;
          /* Scroll iOS interne pour la liste si besoin */
          overflow: hidden; 
        }

        .wario-title {
          color: var(--theme-color);
          font-size: 1.5rem;
          text-align: center;
          margin-top: 25px;
        }

        .wario-motto {
          text-align: center;
          font-style: italic;
          color: #aa8800;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }

        /* Design Liste iOS iOS 15+ */
        .ios-list {
          flex: 1;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          margin: 0 15px 15px 15px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch; /* Scroll fluide iOS */
          scrollbar-width: none;
        }
        .ios-list::-webkit-scrollbar { display: none; }

        .ios-list-item {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          position: relative;
          cursor: pointer;
          transition: background 0.2s;
        }

        .ios-list-item:active {
          background: rgba(255,255,255,0.1);
        }

        .item-icon-circle {
          width: 40px; height: 40px;
          background: rgba(0,0,0,0.5);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          margin-right: 15px;
        }

        .item-details { flex: 1; }
        .item-details h4 { font-size: 0.95rem; color: white; margin-bottom: 3px; }
        .item-details p { font-size: 0.8rem; color: var(--theme-color); font-weight: bold; }

        .chevron { opacity: 0.5; }

        .ios-separator {
          position: absolute;
          bottom: 0; right: 0;
          width: calc(100% - 75px);
          height: 1px;
          background: rgba(255,255,255,0.08);
        }

        .qr-modal-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(10px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
        }

        .qr-modal-box {
          background: white;
          color: black;
          width: 80%;
          border-radius: 30px;
          padding: 30px 20px;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
        }

        .qr-modal-box h3 { margin-top: 15px; font-size: 1.3rem; }
        
        .qr-code-text {
          font-family: monospace;
          background: #f0f0f0;
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 1.2rem;
          letter-spacing: 2px;
          margin: 15px 0;
          font-weight: bold;
        }

        .qr-modal-box p { color: #555; font-size: 0.9rem; margin-bottom: 25px; }

        .qr-close-btn {
          background: #333;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 1rem;
          width: 100%;
        }
      `}</style>
    </motion.div>
  );
}
