import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, Swords, Zap, XCircle, ShoppingBag, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Connexion au serveur Node (Environnement dynamique)
const DEV_IP = window.location.hostname;
const WS_URL = import.meta.env.VITE_WS_URL || `http://${DEV_IP}:3001`;
const socket = io(WS_URL);

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState(0);
  const [orders, setOrders] = useState([]);
  const [activeHappening, setActiveHappening] = useState(null);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Stats joueurs
    socket.on('player_joined', (data) => setPlayers(data.totalPlayers));
    socket.on('player_left', (data) => setPlayers(data.totalPlayers));

    // Réception des commandes Wario Bar
    socket.on('order_received', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('order_received');
    };
  }, []);

  const trigger = (type) => {
    socket.emit('trigger_happening', type);
    setActiveHappening(type);
  };

  const deleteOrder = (indexToRemove) => {
    setOrders(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const clearHappening = () => {
    socket.emit('clear_happening');
    setActiveHappening(null);
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR : CONTROLES ADMIN */}
      <div className="sidebar">
        <div className="panel">
          <div className="panel-title">
            <div className="status-indicator" style={{ background: isConnected ? '#00ffcc' : '#ff0000' }}></div>
            Serveur Principal
          </div>
          <div className="stat-box">
            <h3>{players}</h3>
            <p>Joueurs Connectés</p>
          </div>
        </div>

        <div className="panel" style={{ flex: 1 }}>
          <div className="panel-title"><Zap size={18} /> GOD MODE</div>
          <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '20px' }}>
            Déclenche des événements de crise sur tous les iPhones connectés simultanément.
          </p>

          <button className="god-btn btn-danger" onClick={() => trigger('BAGARRE')}>
            <Swords size={20} /> BAGARRE GÉNÉRALE
          </button>

          <button className="god-btn btn-brazzers" onClick={() => trigger('BRAZZERS')}>
            🔞 ALERTE BRAZZERS
          </button>

          <button className="god-btn btn-warning" onClick={() => trigger('KIDNAPPING')}>
            <ShieldAlert size={20} /> ALERTE ENLÈVEMENT
          </button>

          <button className="god-btn" style={{ background: '#0055ff', color: 'white', marginTop: '10px' }} onClick={() => trigger('GARDE_A_VOUS')}>
            🎖️ GARDE À VOUS
          </button>

          <button className="god-btn" style={{ background: '#9900ff', color: 'white', marginTop: '10px' }} onClick={() => trigger('RAOUL')}>
            🤮 RAOUL GÉNÉRAL
          </button>

          <div style={{ marginTop: 'auto' }}>
            {activeHappening && (
              <button className="god-btn btn-clear" onClick={clearHappening}>
                <XCircle size={20} /> STOPPER ALERTE
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN : CAISSE WARIO BAR */}
      <div className="panel main-content">
        <div className="panel-title"><ShoppingBag size={18} /> COMMANDES EN DIRECT (Wario Bar)</div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} />
            <p style={{ marginTop: '15px' }}>En attente de commandes...</p>
          </div>
        ) : (
          <div className="orders-list">
            <AnimatePresence>
              {orders.map((order, idx) => (
                <motion.div
                  key={idx}
                  className="order-card"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  layout
                >
                  <div className="order-info">
                    <h4>{order.item}</h4>
                    <p>Client: <span className="order-user">{order.username}</span> • {new Date(order.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <div className="order-price" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {order.price && <span>{order.price / 1000}k 🟡</span>}
                    <button
                      onClick={() => deleteOrder(idx)}
                      style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Livrée ✓
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
