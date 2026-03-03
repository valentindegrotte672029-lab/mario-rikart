import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, Swords, Zap, XCircle, ShoppingBag, Users, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Connexion au serveur Node (Environnement dynamique)
const DEV_IP = window.location.hostname;
const WS_URL = import.meta.env.VITE_WS_URL || `http://${DEV_IP}:3001`;
const socket = io(WS_URL);

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState(0);
  const [orders, setOrders] = useState([]);
  const [bereals, setBereals] = useState([]);
  const [leaderboards, setLeaderboards] = useState({ FLAPPYWEED: {}, CHAMPININJA: {}, DOODLEWEED: {} });
  const [activeHappening, setActiveHappening] = useState(null);
  const [activeTab, setActiveTab] = useState('WARIO'); // 'WARIO', 'BEREAL', 'ARCADE'

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('request_bereals');
    });
    socket.on('disconnect', () => setIsConnected(false));

    // Stats joueurs
    socket.on('player_joined', (data) => setPlayers(data.totalPlayers));
    socket.on('player_left', (data) => setPlayers(data.totalPlayers));

    // Réception des commandes Wario Bar
    socket.on('order_received', (order) => setOrders(prev => [order, ...prev]));

    // Réception BeReals
    socket.on('bereals_history', (history) => setBereals(history));
    socket.on('bereal_broadcast', (post) => setBereals(prev => [post, ...prev]));
    socket.on('bereal_deleted', (postId) => setBereals(prev => prev.filter(b => b.id !== postId)));

    // Réception Leaderboards
    socket.on('leaderboards_update', (data) => setLeaderboards(data));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('order_received');
      socket.off('bereals_history');
      socket.off('bereal_broadcast');
      socket.off('bereal_deleted');
      socket.off('leaderboards_update');
    };
  }, []);

  const trigger = (type) => {
    socket.emit('trigger_happening', type);
    setActiveHappening(type);
  };

  const deleteOrder = (indexToRemove) => {
    setOrders(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDeleteBereal = (postId) => {
    socket.emit('delete_bereal', postId);
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

      {/* MAIN CONTENT : TABS (COMMANDES / BEREALS) */}
      <div className="panel main-content" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* Navigation des Onglets */}
        <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('WARIO')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'WARIO' ? '#ffcc00' : '#222', color: activeTab === 'WARIO' ? '#000' : '#aaa' }}
          >
            <ShoppingBag size={18} /> COMMANDES BAR ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('BEREAL')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'BEREAL' ? '#ff3333' : '#222', color: activeTab === 'BEREAL' ? '#fff' : '#aaa' }}
          >
            <Camera size={18} /> FEED BeMARIO ({bereals.length})
          </button>

          <button
            onClick={() => setActiveTab('ARCADE')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'ARCADE' ? '#39ff14' : '#222', color: activeTab === 'ARCADE' ? '#000' : '#aaa' }}
          >
            <Swords size={18} /> LUI-WEED ARCADE
          </button>
        </div>

        {/* CONTENU ONGLETS */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {activeTab === 'WARIO' && (
            orders.length === 0 ? (
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
            )
          )}

          {activeTab === 'BEREAL' && (
            bereals.length === 0 ? (
              <div className="empty-state">
                <Camera size={48} />
                <p style={{ marginTop: '15px' }}>Aucune publication pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                <AnimatePresence>
                  {bereals.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      layout
                      style={{ background: '#111', borderRadius: '15px', overflow: 'hidden', border: '1px solid #333' }}
                    >
                      <img src={post.image} alt="Bereal" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }} />
                      <div style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ff3333' }}>
                          <strong>{post.username}</strong>
                          <small style={{ color: '#888' }}>{new Date(post.timestamp).toLocaleTimeString()}</small>
                        </div>
                        {post.caption && <p style={{ fontSize: '0.9rem', color: '#eee' }}>{post.caption}</p>}
                        <button
                          onClick={() => handleDeleteBereal(post.id)}
                          style={{ marginTop: '10px', width: '100%', background: '#ff3333', color: 'white', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          )}

          {activeTab === 'ARCADE' && (
            <div style={{ padding: '20px', background: '#111', borderRadius: '15px', color: 'white' }}>
              <h2 style={{ color: '#39ff14', marginBottom: '20px' }}>🏆 Classements Mondiaux Arcade</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* FlappyWeed */}
                <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
                  <h3 style={{ color: '#aaffaa', marginBottom: '15px' }}>🪽 Roule-Ta-Fleur</h3>
                  {Object.keys(leaderboards.FLAPPYWEED || {}).length === 0 ? <p style={{ color: '#888' }}>Aucun score</p> : (
                    Object.entries(leaderboards.FLAPPYWEED)
                      .sort(([, a], [, b]) => b.score - a.score)
                      .map(([user, data], i) => (
                        <div key={user} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                          <span><strong style={{ color: i === 0 ? '#ffcc00' : 'white' }}>#{i + 1}</strong> {user}</span>
                          <span style={{ color: '#39ff14', fontWeight: 'bold' }}>{data.score}</span>
                        </div>
                      ))
                  )}
                </div>

                {/* ChampiNinja */}
                <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
                  <h3 style={{ color: '#aaffaa', marginBottom: '15px' }}>🍄 Champi Ninja</h3>
                  {Object.keys(leaderboards.CHAMPININJA || {}).length === 0 ? <p style={{ color: '#888' }}>Aucun score</p> : (
                    Object.entries(leaderboards.CHAMPININJA)
                      .sort(([, a], [, b]) => b.score - a.score)
                      .map(([user, data], i) => (
                        <div key={user} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                          <span><strong style={{ color: i === 0 ? '#ffcc00' : 'white' }}>#{i + 1}</strong> {user}</span>
                          <span style={{ color: '#39ff14', fontWeight: 'bold' }}>{data.score}</span>
                        </div>
                      ))
                  )}
                </div>

                {/* DoodleWeed */}
                <div style={{ background: '#222', padding: '20px', borderRadius: '10px', border: '1px solid #333' }}>
                  <h3 style={{ color: '#aaffaa', marginBottom: '15px' }}>🚀 Doodle-Weed</h3>
                  {Object.keys(leaderboards.DOODLEWEED || {}).length === 0 ? <p style={{ color: '#888' }}>Aucun score</p> : (
                    Object.entries(leaderboards.DOODLEWEED)
                      .sort(([, a], [, b]) => b.score - a.score)
                      .map(([user, data], i) => (
                        <div key={user} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                          <span><strong style={{ color: i === 0 ? '#ffcc00' : 'white' }}>#{i + 1}</strong> {user}</span>
                          <span style={{ color: '#39ff14', fontWeight: 'bold' }}>{data.score}</span>
                        </div>
                      ))
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
