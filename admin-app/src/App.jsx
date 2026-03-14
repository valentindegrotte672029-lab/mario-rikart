import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, Swords, Zap, XCircle, ShoppingBag, Users, Camera, Bell, Trash2 } from 'lucide-react';
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
  const [usersData, setUsersData] = useState([]);
  const [bets, setBets] = useState([]);
  const [pokerLive, setPokerLive] = useState(null);
  const [pokerHistory, setPokerHistory] = useState([]);
  const [pokerTables, setPokerTables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [activeHappening, setActiveHappening] = useState(null);
  const [activeTab, setActiveTab] = useState('WARIO'); // 'WARIO', 'BEREAL', 'ARCADE', 'USERS', 'BETS', 'POKER'

  // Formulaire Paris
  const [betQuestion, setBetQuestion] = useState('');
  const [betOptions, setBetOptions] = useState(['', '']);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('request_bereals');
      socket.emit('join_admin');
      socket.emit('get_all_users');
    });
    socket.on('disconnect', () => setIsConnected(false));

    // Stats joueurs
    socket.on('player_joined', (data) => setPlayers(data.totalPlayers));
    socket.on('player_left', (data) => setPlayers(data.totalPlayers));

    // Réception des commandes Wario Bar
    socket.on('order_received', (order) => setOrders(prev => [order, ...prev]));
    socket.on('sync_orders', (history) => setOrders(history.slice().reverse()));

    // Réception BeReals
    socket.on('bereals_history', (history) => setBereals(history));
    socket.on('bereal_broadcast', (post) => setBereals(prev => [post, ...prev]));
    socket.on('bereal_deleted', (postId) => setBereals(prev => prev.filter(b => b.id !== postId)));

    // Réception Leaderboards
    socket.on('leaderboards_update', (data) => setLeaderboards(data));

    // Réception Liste Joueurs
    socket.on('users_data', (data) => setUsersData(data));
    socket.on('user_updated', ({ username, balance, socialStatus, peachUnlock }) => {
      setUsersData(prev => prev.map(u => u.username === username ? { ...u, balance, socialStatus, peachUnlock } : u));
    });

    // Réception des Paris
    socket.on('sync_bets', (data) => setBets(data));

    // Poker
    socket.on('poker_state', (state) => setPokerLive(state));
    socket.on('poker_history', (history) => setPokerHistory(history));
    socket.on('poker_admin_tables', (tables) => setPokerTables(tables));

    // Notifications
    socket.on('admin_notification', (notif) => setNotifications(prev => [notif, ...prev]));
    socket.on('admin_notifications_history', (history) => setNotifications(history));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('order_received');
      socket.off('sync_orders');
      socket.off('bereals_history');
      socket.off('bereal_broadcast');
      socket.off('bereal_deleted');
      socket.off('leaderboards_update');
      socket.off('users_data');
      socket.off('user_updated');
      socket.off('sync_bets');
      socket.off('poker_state');
      socket.off('poker_history');
      socket.off('poker_admin_tables');
      socket.off('admin_notification');
      socket.off('admin_notifications_history');
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="admin-layout">
      {/* NOTIFICATION BELL (floating) */}
      <div style={{ position: 'fixed', top: 15, right: 20, zIndex: 9999, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifPanel(!showNotifPanel)}>
          <Bell size={28} color={unreadCount > 0 ? '#ffcc00' : '#888'} />
          {unreadCount > 0 && (
            <div style={{ position: 'absolute', top: -5, right: -5, background: '#ff3333', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>{unreadCount}</div>
          )}
        </div>
      </div>

      {/* NOTIFICATION PANEL */}
      <AnimatePresence>
        {showNotifPanel && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{ position: 'fixed', top: 55, right: 15, width: 380, maxHeight: '70vh', background: '#1a1a1a', border: '1px solid #333', borderRadius: '15px', zIndex: 9998, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: 'white' }}>🔔 Notifications</h3>
              <button onClick={() => { socket.emit('clear_notifications'); setNotifications([]); }} style={{ background: '#333', color: '#888', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>Tout effacer</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {notifications.length === 0 ? (
                <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Aucune notification</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{ padding: '10px', background: n.read ? '#111' : '#1a2a1a', border: n.read ? '1px solid #222' : '1px solid #4ade80', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer' }}
                    onClick={() => {
                      socket.emit('mark_notification_read', n.id);
                      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: n.type === 'PEACH' ? '#ff69b4' : n.type === 'POKER' ? '#4ade80' : '#ffcc00', fontWeight: 'bold', fontSize: '0.8rem' }}>{n.type}</span>
                      <span style={{ color: '#888', fontSize: '0.7rem' }}>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ color: 'white', margin: 0, fontSize: '0.9rem' }}>{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

          <button
            onClick={() => { setActiveTab('USERS'); socket.emit('get_all_users'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'USERS' ? '#00ffcc' : '#222', color: activeTab === 'USERS' ? '#000' : '#aaa' }}
          >
            <Users size={18} /> JOUEURS ({usersData.length})
          </button>

          <button
            onClick={() => setActiveTab('BETS')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'BETS' ? '#ff00ff' : '#222', color: activeTab === 'BETS' ? '#000' : '#aaa' }}
          >
             🎰 PARIS ({bets.filter(b => b.status === 'OPEN').length})
          </button>

          <button
            onClick={() => { setActiveTab('POKER'); socket.emit('request_poker_stats'); socket.emit('poker_admin_list'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', background: activeTab === 'POKER' ? '#4ade80' : '#222', color: activeTab === 'POKER' ? '#000' : '#aaa' }}
          >
             🃁 POKER ({pokerTables.length})
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
              <div className="orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', padding: '10px' }}>
                <AnimatePresence>
                  {Object.entries(
                    orders.reduce((acc, order) => {
                      if (!acc[order.username]) acc[order.username] = [];
                      acc[order.username].push(order);
                      return acc;
                    }, {})
                  ).map(([user, userOrders]) => (
                    <motion.div
                      key={user}
                      className="user-ticket-card"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      layout
                      style={{ background: '#222', borderRadius: '15px', padding: '15px', border: '1px solid #ffcc00' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #444', paddingBottom: '10px', marginBottom: '10px' }}>
                        <h3 style={{ color: '#ffcc00', margin: 0, fontSize: '1.2rem', textTransform: 'uppercase' }}>Ticket de {user}</h3>
                        <span style={{ color: '#aaa', fontSize: '0.8rem' }}>{userOrders.length} article(s)</span>
                      </div>
                      
                      <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 15px 0' }}>
                        {userOrders.map((o, i) => (
                           <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #333' }}>
                             <span style={{ color: 'white', fontWeight: 'bold' }}>- {o.item}</span>
                             <span style={{ color: '#00ffcc' }}>{o.price / 1000}k 🟡</span>
                           </li>
                        ))}
                      </ul>

                      <button 
                        onClick={() => {
                            setOrders(prev => prev.filter(o => o.username !== user));
                            socket.emit('delete_user_orders', user);
                        }}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#4CAF50', color: 'white', fontWeight: '900', cursor: 'pointer', transition: 'transform 0.1s' }}
                        onMouseDown={(e) => e.target.style.transform = 'scale(0.97)'}
                        onMouseUp={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        ✔ SERVIR LA TABLE COMPLÈTE
                      </button>
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

          {activeTab === 'USERS' && (
            <div style={{ padding: '20px', background: '#111', borderRadius: '15px', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#00ffcc', margin: 0 }}>👥 Liste des Comptes</h2>
                <button 
                  onClick={() => socket.emit('get_all_users')}
                  style={{ background: '#222', color: '#00ffcc', border: '1px solid #00ffcc', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Rafraîchir
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#222', color: '#aaa' }}>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333' }}>Alias</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333' }}>Mot de Passe</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333' }}>Inscription</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', color: '#ffcc00' }}>Solde</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', color: '#ff69b4' }}>Peach</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center' }}>Statut Social</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', color: '#aaffaa' }}>Roule-Ta-Fleur</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', color: '#aaffaa' }}>Ninja</th>
                      <th style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', color: '#aaffaa' }}>Doodle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Aucun compte trouvé</td>
                      </tr>
                    ) : (
                      usersData.map((user, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#1a1a1a' : '#111', transition: 'background 0.2s' }}>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', fontWeight: 'bold', color: 'white' }}>{user.username}</td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', fontFamily: 'monospace', color: '#ffaaaa' }}>{user.password || '---'}</td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', color: '#aaa', fontSize: '0.9rem' }}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Inconnu'}
                          </td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', fontWeight: 'bold', color: '#ffcc00' }}>{user.balance ?? '---'} 🟡</td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', fontWeight: 'bold', color: user.peachUnlock === 'vip' ? '#ff69b4' : user.peachUnlock === 'basic' ? '#ffaa88' : '#888' }}>{user.peachUnlock || 'none'}</td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', color: '#aaa' }}>{user.socialStatus || '---'}</td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', fontWeight: 'bold', color: '#39ff14' }}>{user.scores?.FLAPPYWEED ?? 0}</td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', fontWeight: 'bold', color: '#39ff14' }}>{user.scores?.CHAMPININJA ?? 0}</td>
                          <td style={{ padding: '15px', borderBottom: '1px solid #333', textAlign: 'center', fontWeight: 'bold', color: '#39ff14' }}>{user.scores?.DOODLEWEED ?? 0}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'BETS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* CREATION D'UN PARI */}
              <div style={{ padding: '20px', background: '#2a1a2a', borderRadius: '15px', color: 'white', border: '1px solid #ff00ff' }}>
                <h2 style={{ color: '#ff00ff', margin: '0 0 15px 0' }}>🪄 Créer un Pari PolyMarket</h2>
                <input 
                  type="text" 
                  placeholder="Ex: Qui va finir dans la piscine ce soir ?" 
                  value={betQuestion}
                  onChange={e => setBetQuestion(e.target.value)}
                  style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: 'none', background: '#111', color: 'white' }}
                />
                
                {betOptions.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input 
                      type="text" 
                      placeholder={`Option ${idx + 1}`} 
                      value={opt}
                      onChange={e => {
                        const newOpts = [...betOptions];
                        newOpts[idx] = e.target.value;
                        setBetOptions(newOpts);
                      }}
                      style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none', background: '#111', color: 'white' }}
                    />
                    {betOptions.length > 2 && (
                      <button onClick={() => setBetOptions(betOptions.filter((_, i) => i !== idx))} style={{ background: '#ff3333', color: 'white', border: 'none', borderRadius: '5px', padding: '0 15px', cursor: 'pointer' }}>X</button>
                    )}
                  </div>
                ))}
                
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <button 
                    onClick={() => setBetOptions([...betOptions, ''])}
                    style={{ background: '#444', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', cursor: 'pointer' }}
                  >
                    + Ajouter Option
                  </button>
                  <button 
                    onClick={() => {
                        const validOpts = betOptions.filter(o => o.trim() !== '');
                        if (betQuestion.trim() && validOpts.length >= 2) {
                            socket.emit('create_bet', { question: betQuestion, options: validOpts });
                            setBetQuestion('');
                            setBetOptions(['', '']);
                        } else {
                            alert("Il faut une question et au moins 2 options !");
                        }
                    }}
                    style={{ background: '#ff00ff', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🚀 Lancer le Pari sur les Téléphones
                  </button>
                </div>
              </div>

              {/* LISTE DES PARIS ACTIFS ET TERMINES */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {bets.map(bet => {
                  const totalPot = bet.betsPlaced.reduce((acc, b) => acc + b.amount, 0);
                  return (
                    <div key={bet.id} style={{ background: '#111', border: bet.status === 'OPEN' ? '2px solid #ff00ff' : '2px solid #444', borderRadius: '15px', padding: '20px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 10, right: 10, background: bet.status === 'OPEN' ? '#ff00ff' : '#444', color: 'white', padding: '3px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {bet.status === 'OPEN' ? 'EN COURS' : 'TERMINÉ'}
                      </div>
                      
                      <h3 style={{ color: 'white', marginTop: 0, marginBottom: '5px', paddingRight: '60px' }}>{bet.question}</h3>
                      <p style={{ color: '#aaa', margin: '0 0 15px 0', fontSize: '0.9rem' }}>Cagnotte Globale: <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{totalPot} 🟡</span></p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {bet.options.map((opt, idx) => {
                          const optionBets = bet.betsPlaced.filter(b => b.optionIdx === idx);
                          const optionTotal = optionBets.reduce((acc, b) => acc + b.amount, 0);
                          const percentage = totalPot > 0 ? ((optionTotal / totalPot) * 100).toFixed(0) : 0;
                          const isWinner = bet.winningOption === idx;

                          return (
                            <div key={idx} style={{ background: isWinner ? '#004400' : '#222', border: isWinner ? '1px solid #39ff14' : '1px solid #333', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: isWinner ? '#aaffaa' : 'white', fontWeight: 'bold' }}>{opt}</div>
                                <div style={{ color: '#888', fontSize: '0.8rem' }}>{optionTotal} 🟡 misés en tout ({percentage}%)</div>
                              </div>
                              
                              {bet.status === 'OPEN' && (
                                <button
                                  onClick={() => {
                                      if(window.confirm(`Déclarer "${opt}" comme gagnant ? Cela va injecter l'argent en fraude et redistribuer la cagnotte aux gagnants.`)) {
                                          socket.emit('resolve_bet', { betId: bet.id, winningOptionIdx: idx });
                                      }
                                  }}
                                  style={{ background: '#ff00ff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                                >
                                  C'est la réponse !
                                </button>
                              )}
                              {isWinner && <span style={{ color: '#39ff14', fontWeight: 'bold' }}>🏆 GAGNANT</span>}
                            </div>
                          );
                        })}
                      </div>

                      {bet.status === 'RESOLVED' && (
                         <button 
                            onClick={() => socket.emit('delete_bet', bet.id)}
                            style={{ width: '100%', marginTop: '15px', background: 'transparent', border: '1px solid #555', color: '#888', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}
                         >
                            Supprimer des archives
                         </button>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* --- FIN DES ONGLETS EXISTANTS --- */}

          {activeTab === 'POKER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* ALL TABLES MANAGEMENT */}
              <div style={{ padding: '20px', background: '#0a1f0a', borderRadius: '15px', border: '1px solid #4ade80' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h2 style={{ color: '#4ade80', margin: 0 }}>🃏 Toutes les Tables ({pokerTables.length})</h2>
                  <button onClick={() => socket.emit('poker_admin_list')} style={{ background: '#222', color: '#4ade80', border: '1px solid #4ade80', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Rafraîchir</button>
                </div>

                {pokerTables.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                    <p style={{ fontSize: '1.2rem' }}>Aucune table créée</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '15px' }}>
                    {pokerTables.map(table => (
                      <div key={table.roomCode} style={{ background: '#111', borderRadius: '12px', padding: '15px', border: table.status !== 'WAITING' ? '2px solid #4ade80' : '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div>
                            <span style={{ color: '#ffcc00', fontWeight: 900, fontFamily: 'monospace', fontSize: '1.3rem', letterSpacing: '3px' }}>{table.roomCode}</span>
                            <span style={{ color: '#888', marginLeft: '10px', fontSize: '0.8rem' }}>par {table.creator}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ background: table.status !== 'WAITING' ? '#4ade80' : '#888', color: '#000', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              {table.status === 'WAITING' ? 'EN ATTENTE' : 'EN JEU'}
                            </span>
                            <button
                              onClick={() => { if(window.confirm(`Supprimer la table ${table.roomCode} ?`)) socket.emit('poker_admin_delete', table.roomCode); }}
                              style={{ background: '#ff3333', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Players list */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {table.players.map((p, i) => (
                            <div key={i} style={{ background: '#222', padding: '6px 10px', borderRadius: '8px', fontSize: '0.85rem', border: p.folded ? '1px solid #ff6b6b' : '1px solid #333', opacity: p.folded ? 0.5 : 1 }}>
                              <span style={{ color: 'white', fontWeight: 'bold' }}>{p.username}</span>
                              {p.isBot && ' 🤖'}
                              <span style={{ color: '#ffcc00', marginLeft: '6px' }}>{p.chips}🟡</span>
                            </div>
                          ))}
                        </div>

                        {/* Game info */}
                        {table.status !== 'WAITING' && (
                          <div style={{ display: 'flex', gap: '15px', color: '#aaa', fontSize: '0.8rem' }}>
                            <span>POT: <b style={{ color: '#ffcc00' }}>{table.pot}🟡</b></span>
                            <span>Gain: <b style={{ color: '#4ade80' }}>{table.prizePool}🟡</b></span>
                            <span>Main #{table.handsPlayed || 1}</span>
                          </div>
                        )}

                        {/* Pending join requests */}
                        {table.pendingRequests && table.pendingRequests.length > 0 && (
                          <div style={{ marginTop: '8px', padding: '8px', background: '#2a1a00', borderRadius: '8px', border: '1px solid #ffcc00' }}>
                            <span style={{ color: '#ffcc00', fontSize: '0.8rem', fontWeight: 'bold' }}>⏳ Demandes en attente:</span>
                            {table.pendingRequests.map((r, i) => (
                              <span key={i} style={{ color: 'white', marginLeft: '8px', fontSize: '0.85rem' }}>{r.username}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* POKER STATS TABLE */}
              <div style={{ padding: '20px', background: '#111', borderRadius: '15px', color: 'white' }}>
                <h2 style={{ color: '#4ade80', margin: '0 0 15px 0' }}>📊 Historique & Statistiques</h2>
                {pokerHistory.length === 0 ? (
                  <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Aucune partie terminée pour l'instant.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#222', color: '#aaa' }}>
                          <th style={{ padding: '12px', borderBottom: '1px solid #333' }}>Joueur</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #333', textAlign: 'center' }}>Parties</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #333', textAlign: 'center', color: '#4ade80' }}>Victoires</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #333', textAlign: 'center', color: '#ff6b6b' }}>Défaites</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #333', textAlign: 'center', color: '#ffcc00' }}>Gains Totaux</th>
                          <th style={{ padding: '12px', borderBottom: '1px solid #333', textAlign: 'center' }}>Win Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pokerHistory.map((stat, idx) => (
                          <tr key={idx} style={{ background: idx % 2 === 0 ? '#1a1a1a' : '#111' }}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #222', fontWeight: 'bold' }}>{stat.username}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #222', textAlign: 'center' }}>{stat.games}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #222', textAlign: 'center', color: '#4ade80', fontWeight: 'bold' }}>{stat.wins}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #222', textAlign: 'center', color: '#ff6b6b' }}>{stat.games - stat.wins}</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #222', textAlign: 'center', color: '#ffcc00', fontWeight: 'bold' }}>{stat.totalWinnings} 🟡</td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #222', textAlign: 'center', fontWeight: 'bold', color: (stat.wins / stat.games * 100) > 50 ? '#4ade80' : '#ff6b6b' }}>
                              {stat.games > 0 ? (stat.wins / stat.games * 100).toFixed(0) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
