import React, { useEffect, useRef, useCallback, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ToadBank from './components/ToadBank';
import SplashScreen from './components/SplashScreen';
import PageHome from './components/PageHome';

import PageLuigi from './components/PageLuigiNew';
import PageToad from './components/PageToad';
import PagePeach from './components/PagePeach';
import PageMario from './components/PageMario';
import PageWario from './components/PageWario';
import PageChrono from './components/PageChrono';
import PagePsych from './components/PagePsych';
import PageCasino from './components/PageCasino';
import PageTrombi from './components/PageTrombi';
import Navigation from './components/Navigation';

import useStore from './store/useStore';
import { socket } from './socket';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ zIndex: 99999, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#990000', color: 'white', padding: '20px', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>💥 CRASH FATAL 💥</h1>
          <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '10px' }}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', background: 'rgba(0,0,0,0.5)', padding: '10px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { currentPage, setPage, resetSpeed, happening, triggerHappening, username, setBereals, addBereal, deleteBereal, setLeaderboards, setActiveUsers, errorMsg, balance, socialStatus, setBets, setBalance, setPokerState, setPokerRooms, bgOverride } = useStore();

  const SWIPE_PAGES = ['WARIO', 'TOAD', 'PEACH', 'LUIGI', 'MARIO', 'CHRONO', 'CASINO', 'TROMBI', 'PSYCH'];
  const swipeDir = useRef(1);
  const touchRef = useRef({ startX: 0, startY: 0, swiping: false });

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    const tag = e.target.tagName;
    const type = e.target.type;
    const isInteractive = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || type === 'range';
    touchRef.current = { startX: t.clientX, startY: t.clientY, swiping: false, blocked: isInteractive };
  }, []);

  const onTouchMove = useCallback((e) => {
    if (touchRef.current.swiping) return;
    const t = e.touches[0];
    const dx = Math.abs(t.clientX - touchRef.current.startX);
    const dy = Math.abs(t.clientY - touchRef.current.startY);
    // Lock direction after 10px of movement
    if (dx > 10 || dy > 10) {
      touchRef.current.swiping = true;
      touchRef.current.horizontal = dx > dy;
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!touchRef.current.horizontal || touchRef.current.blocked) return;
    const endX = e.changedTouches[0].clientX;
    const diff = endX - touchRef.current.startX;
    const THRESHOLD = 60;
    const idx = SWIPE_PAGES.indexOf(currentPage);
    if (idx === -1) return;
    if (diff < -THRESHOLD && idx < SWIPE_PAGES.length - 1) {
      swipeDir.current = 1;
      setPage(SWIPE_PAGES[idx + 1]);
      setTimeout(() => resetSpeed(), 1200);
    } else if (diff > THRESHOLD && idx > 0) {
      swipeDir.current = -1;
      setPage(SWIPE_PAGES[idx - 1]);
      setTimeout(() => resetSpeed(), 1200);
    }
  }, [currentPage, setPage, resetSpeed]);

  // Gestion des WebSockets en temps réel (Remplace le mock)
  useEffect(() => {
    if (username) {
      // 1. Connexion au serveur
      socket.connect();
      socket.emit('join_game', username);

      const onConnect = () => {
         const state = useStore.getState();
         socket.emit('sync_user_data', { 
             username: state.username, 
             balance: state.balance, 
             socialStatus: state.socialStatus,
             peachUnlock: state.peachUnlock
         });
      };
      socket.on('connect', onConnect);
       
      // 2. Écoute du 'God Mode' (Alertes Centrales)
      socket.on('global_happening', (type) => triggerHappening(type));
      socket.on('bereals_history', (history) => setBereals(history));
      socket.on('leaderboards_update', (leaderboards) => setLeaderboards(leaderboards));
      socket.on('bereal_broadcast', (post) => addBereal(post));
      socket.on('bereal_deleted', (postId) => deleteBereal(postId));
      socket.on('active_users', (users) => setActiveUsers(users));
      socket.on('sync_bets', (bets) => setBets(bets));
      socket.on('balance_update', (newBalance) => setBalance(newBalance));
      socket.on('bet_resolved', () => {
          // Si un pari est résolu par l'admin, on synchronise notre balance globale
          socket.emit('request_my_balance', username);
      });
      socket.on('poker_state', (state) => setPokerState(state));
      socket.on('poker_error', (err) => alert("Poker: " + err));
      socket.on('poker_rooms', (rooms) => setPokerRooms(rooms));
      socket.on('poker_queue_update', (data) => {
        useStore.getState().setPokerQueue(data);
      });
      socket.on('poker_join_request', (data) => {
        useStore.getState().addJoinRequest(data);
      });
      socket.on('poker_request_sent', () => {
        useStore.getState().setPendingJoinRequest(true);
      });
      socket.on('poker_join_denied', () => {
        useStore.getState().setPendingJoinRequest(false);
        alert('Ta demande a été refusée.');
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('global_happening');
        socket.off('bereals_history');
        socket.off('bereal_broadcast');
        socket.off('bereal_deleted');
        socket.off('active_users');
        socket.off('sync_bets');
        socket.off('balance_update');
        socket.off('bet_resolved');
        socket.off('poker_state');
        socket.off('poker_error');
        socket.off('poker_rooms');
        socket.off('poker_queue_update');
        socket.off('poker_join_request');
        socket.off('poker_request_sent');
        socket.off('poker_join_denied');
        socket.disconnect();
      };
    }
  }, [username, triggerHappening, setBereals, addBereal, deleteBereal, setLeaderboards, setActiveUsers, setBets, setBalance, setPokerState, setPokerRooms]);

  // Synchronisation continue des pièces, rang et peachUnlock vers le serveur
  const peachUnlock = useStore(s => s.peachUnlock);
  useEffect(() => {
    if (username && socket.connected) {
      socket.emit('sync_user_data', { username, balance, socialStatus, peachUnlock });
    }
  }, [balance, socialStatus, peachUnlock, username]);

  const BG_ASSET_VERSION = '20260317a';
  const THEME_BY_PAGE = {
    MARIO: {
      glow: '#FF0000',
      glowSoft: 'rgba(255, 0, 0, 0.35)',
      bg: `linear-gradient(145deg, rgba(255,0,0,0.35), rgba(25,0,0,0.92)), url('/images/backgrounds/bg_bemario_speedlines_legacy.jpg?v=${BG_ASSET_VERSION}')`,
    },
    LUIGI: {
      glow: '#39FF14',
      glowSoft: 'rgba(57, 255, 20, 0.35)',
      bg: `linear-gradient(145deg, rgba(57,255,20,0.30), rgba(0,20,0,0.94)), url('/images/backgrounds/bg_luiweed_mist_v3.png?v=${BG_ASSET_VERSION}')`,
    },
    PEACH: {
      glow: '#FF00FF',
      glowSoft: 'rgba(255, 0, 255, 0.32)',
      bg: `linear-gradient(145deg, rgba(255,0,255,0.28), rgba(35,0,35,0.92)), url('/images/backgrounds/bg_peachasse_silk_v3.png?v=${BG_ASSET_VERSION}')`,
    },
    TOAD: {
      glow: '#4B0082',
      glowSoft: 'rgba(75, 0, 130, 0.35)',
      bg: `linear-gradient(145deg, rgba(75,0,130,0.34), rgba(15,0,30,0.95)), url('/images/backgrounds/bg_toadxique_potions_v3.png?v=${BG_ASSET_VERSION}')`,
    },
    WARIO: {
      glow: '#FFD700',
      glowSoft: 'rgba(255, 215, 0, 0.30)',
      bg: `linear-gradient(145deg, rgba(255,215,0,0.22), rgba(32,20,0,0.92)), url('/images/backgrounds/bg_wario_gold_v3.png?v=${BG_ASSET_VERSION}')`,
    },
    CHRONO: {
      glow: '#FF8C00',
      glowSoft: 'rgba(255, 140, 0, 0.32)',
      bg: `linear-gradient(145deg, rgba(255,140,0,0.25), rgba(25,8,0,0.95)), url('/images/backgrounds/bg_chrono_ripples_v3.png?v=${BG_ASSET_VERSION}')`,
    },
    CASINO: {
      glow: '#00FFFF',
      glowSoft: 'rgba(0, 255, 255, 0.32)',
      bg: `linear-gradient(145deg, rgba(255,0,255,0.24), rgba(0,30,30,0.92)), url('/images/backgrounds/bg_casino_retrowave_v3.png?v=${BG_ASSET_VERSION}')`,
    },
    TROMBI: {
      glow: '#704214',
      glowSoft: 'rgba(112, 66, 20, 0.34)',
      bg: `linear-gradient(145deg, rgba(112,66,20,0.32), rgba(20,14,10,0.95)), url('/images/backgrounds/bg_trombi_classified_v3.jpg?v=${BG_ASSET_VERSION}')`,
    },
    PSYCH: {
      glow: '#00CED1',
      glowSoft: 'rgba(0, 206, 209, 0.32)',
      bg: `linear-gradient(145deg, rgba(0,206,209,0.25), rgba(0,15,20,0.93)), url('/images/backgrounds/bg_psych_neural_v2.jpg?v=${BG_ASSET_VERSION}')`,
    },
  };

  const activeTheme = THEME_BY_PAGE[currentPage] || {
    glow: '#00FFCC',
    glowSoft: 'rgba(0, 255, 204, 0.30)',
    bg: "linear-gradient(145deg, rgba(0,255,204,0.22), rgba(5,8,12,0.95))",
  };
  const effectiveTheme = bgOverride || activeTheme;

  const renderPage = () => {
    switch (currentPage) {
      case 'LUIGI': return <PageLuigi key="luigi" />;
      case 'TOAD': return <PageToad key="toad" />;
      case 'PEACH': return <PagePeach key="peach" />;
      case 'MARIO': return <PageMario key="mario" />;
      case 'WARIO': return <PageWario key="wario" />;
      case 'CHRONO': return <PageChrono key="chrono" />;
      case 'PSYCH': return <PagePsych key="psych" />;
      case 'CASINO': return <PageCasino key="casino" />;
      case 'TROMBI': return <PageTrombi key="trombi" />;
      default: return <PageMario key="mario" />;
    }
  };

  return (
    <div id="app-root">

      {/* 0. Écran Connexion Pseudo (Bloque tout tant que non rempli) */}
      <AnimatePresence>
        {!username && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* 1. Moteur Visuel : crossfade entre fonds d'écran */}
      <div className="bg-scene">
        <AnimatePresence initial={false}>
          <motion.div
            key={effectiveTheme.bg}
            className="background-layer"
            style={{ backgroundImage: effectiveTheme.bg }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          />
        </AnimatePresence>
        <div className="bg-overlay-dark" style={{ '--theme-glow-soft': effectiveTheme.glowSoft }} />
        <div className="stars-css theme-tint" style={{ '--theme-glow': effectiveTheme.glow }} />
      </div>

      {/* 2. HUD Haut (Toad Bank) */}
      <ToadBank />

      {/* 3. Contenu Principal défilant (Zone Mobile) — Swipe horizontal */}
      <main
        className="content-area"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <ErrorBoundary>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentPage}
              className="swipe-page"
              initial={{ x: swipeDir.current * 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: swipeDir.current * -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {/* 4. Navigation Bottom Tab Bar (Snapchat-style) */}
      {username && <Navigation />}

      {/* 5. Alertes Happenings & Erreurs (Economie) */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            className="global-error-toast"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            {errorMsg}
          </motion.div>
        )}
        {happening === 'BAGARRE' && (
          <div className="happening-modal bagarre">
            <h1>BAGARRE GÉNÉRALE !</h1>
          </div>
        )}
        {happening === 'BRAZZERS' && (
          <div className="happening-modal brazzers">
            <h1>🚨 ALERTE BRAZZERS 🚨</h1>
            <p>Bowser a kidnappé Peach !</p>
          </div>
        )}
        {happening === 'KIDNAPPING' && (
          <div className="happening-modal kidnapping">
            <h1>⚠️ ALERTE ENLÈVEMENT ⚠️</h1>
            <p>Le Président Toad a disparu avec la recette du mélange.</p>
          </div>
        )}
        {happening === 'GARDE_A_VOUS' && (
          <div className="happening-modal" style={{ background: '#0033aa', color: 'white', border: '15px solid #0055ff' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 20px #fff' }}>GARDE À VOUS !</h1>
            <p style={{ fontSize: '1.2rem', marginTop: '15px' }}>Fixité absolue exigée.</p>
          </div>
        )}
        {happening === 'RAOUL' && (
          <div className="happening-modal" style={{ background: '#330066', color: '#ffcc00', animation: 'cameraShake 0.1s infinite alternate', border: '10px dashed #cc00ff' }}>
            <h1 style={{ fontSize: '4.5rem', fontWeight: 900 }}>RAOUL !!</h1>
            <p style={{ fontSize: '1.5rem', marginTop: '10px', color: 'white' }}>Préparez les bassines.</p>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        #app-root { width: 100%; height: 100%; display: flex; flex-direction: column; }
        .bg-scene {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: -1;
          overflow: hidden;
        }
        .background-layer {
          position: absolute;
          inset: 0;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .bg-overlay-dark {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at center, var(--theme-glow-soft, rgba(0,255,204,0.3)) 0%, transparent 55%),
            rgba(0, 0, 0, 0.6);
          z-index: 2;
          pointer-events: none;
          transition: background 0.65s ease;
        }

        .theme-tint {
          z-index: 3;
          background-color: var(--theme-glow, rgba(0,255,204,0.2));
          mix-blend-mode: color;
          transition: background-color 0.65s ease;
          opacity: 0.35;
        }
        
        .stars-css {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), rgba(0,0,0,0));
        }

        .content-area {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: calc(var(--safe-top) + var(--header-height) + 20px) 20px calc(var(--safe-bottom) + var(--tab-height) + 20px) 20px;
          position: relative; z-index: 10;
          overflow-y: auto; overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .content-area .glass-panel,
        .content-area .mobile-card,
        .content-area .casino-header,
        .content-area .create-bet-form,
        .content-area .bet-card,
        .content-area .sign-card,
        .content-area .trombi-header,
        .content-area .cw-scam-banner,
        .content-area .trombi-photo-container,
        .content-area .ws-grid {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .content-area button,
        .content-area input,
        .content-area textarea,
        .content-area select {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .content-area > * { width: 100%; max-width: 450px; }
        .swipe-page { width: 100%; max-width: 450px; min-height: 100%; }

        .global-error-toast {
          position: fixed;
          top: 90px;
          left: 5%;
          width: 90%;
          background: rgba(220, 0, 0, 0.95);
          color: white;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          font-weight: bold;
          font-size: 0.95rem;
          z-index: 10000;
          box-shadow: 0 10px 30px rgba(255, 0, 0, 0.4);
          border: 1px solid #ff4444;
          backdrop-filter: blur(10px);
        }

        .home-screen { display: flex; justify-content: center; }
        .main-glass { padding: 40px 30px; border-radius: 40px; text-align: center; position: relative; overflow: hidden; }
        .main-glass h1 { font-size: 3rem; font-weight: 900; margin-bottom: 10px; }
        .main-glass p { color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; font-size: 0.8rem; }
        .glow-orb { position: absolute; top: -50%; left: 50%; transform: translateX(-50%); width: 150px; height: 150px; background: #00ffcc; filter: blur(80px); opacity: 0.3; z-index: -1; transition: background 0.5s ease-in-out;}

        .happening-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 999; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
        
        .bagarre { background: rgba(255, 0, 40, 0.95); color: white; animation: cameraShake 0.1s infinite alternate; }
        .bagarre h1 { font-size: 3.5rem; font-weight: 900; font-style: italic; }
        
        .brazzers { background: #000; color: #ffcc00; border: 8px solid #ffcc00; }
        .brazzers h1 { font-size: 3rem; }

        .kidnapping { background: #ffaa00; color: black; animation: strobe 0.5s infinite alternate; border: 15px solid white; }
        .kidnapping h1 { font-size: 3rem; font-weight: 900; }
        
        @keyframes cameraShake { 0% { transform: translate(5px, 5px) rotate(0deg); } 100% { transform: translate(-5px, -3px) rotate(1deg); } }
        @keyframes strobe { 0% { background: #ffaa00; } 100% { background: #ff0000; color: white; } }
      `}</style>
    </div >
  );
}
