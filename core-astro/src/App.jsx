import React, { useEffect, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';

import RainbowRoad from './components/RainbowRoad';
import ToadBank from './components/ToadBank';
import SplashScreen from './components/SplashScreen';
import PageHome from './components/PageHome';

import PageLuigi from './components/PageLuigiNew';
import PageToad from './components/PageToad';
import PagePeach from './components/PagePeach';
import PageMario from './components/PageMario';
import PageWario from './components/PageWario';
import PageChrono from './components/PageChrono';

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
  const { speedBoost, currentPage, setPage, happening, triggerHappening, username, setBereals, addBereal, deleteBereal, setLeaderboards, setActiveUsers, errorMsg } = useStore();

  // Gestion des WebSockets en temps réel (Remplace le mock)
  useEffect(() => {
    if (username) {
      // 1. Connexion au serveur
      socket.connect();
      socket.emit('join_game', username);

      // 2. Écoute du 'God Mode' (Alertes Centrales)
      socket.on('global_happening', (type) => triggerHappening(type));
      socket.on('bereals_history', (history) => setBereals(history));
      socket.on('leaderboards_update', (leaderboards) => setLeaderboards(leaderboards));
      socket.on('bereal_broadcast', (post) => addBereal(post));
      socket.on('bereal_deleted', (postId) => deleteBereal(postId));
      socket.on('active_users', (users) => setActiveUsers(users));

      return () => {
        socket.off('global_happening');
        socket.off('bereals_history');
        socket.off('bereal_broadcast');
        socket.off('bereal_deleted');
        socket.off('active_users');
        socket.disconnect();
      };
    }
  }, [username, triggerHappening, setBereals, addBereal, deleteBereal, setLeaderboards, setActiveUsers]);

  // Couleurs dynamiques selon la page pour l'ambiance globale
  const getThemeColor = (page) => {
    switch (page) {
      case 'LUIGI': return 'rgba(0, 255, 0, 0.2)'; // Vert toxique
      case 'TOAD': return 'rgba(150, 0, 255, 0.2)'; // Violet néon
      case 'PEACH': return 'rgba(255, 0, 255, 0.2)'; // Rose chaud
      case 'MARIO': return 'rgba(255, 0, 0, 0.2)'; // Rouge sombre
      case 'WARIO': return 'rgba(255, 200, 0, 0.2)'; // Or/Jaune
      case 'CHRONO': return 'rgba(255, 153, 0, 0.2)'; // Orange feu
      default: return 'rgba(0, 255, 204, 0.2)'; // Cyan par défaut
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'LUIGI': return <PageLuigi key="luigi" />;
      case 'TOAD': return <PageToad key="toad" />;
      case 'PEACH': return <PagePeach key="peach" />;
      case 'MARIO': return <PageMario key="mario" />;
      case 'WARIO': return <PageWario key="wario" />;
      case 'CHRONO': return <PageChrono key="chrono" />;
      default: return <PageHome key="home" />;
    }
  };

  return (
    <div id="app-root">

      {/* 0. Écran Connexion Pseudo (Bloque tout tant que non rempli) */}
      <AnimatePresence>
        {!username && <SplashScreen key="splash" />}
      </AnimatePresence>

      {/* 1. Moteur Visuel : Fond CSS + Route 3D */}
      <div className="background-layer" style={{ '--theme-glow': getThemeColor(currentPage) }}>
        <div className="stars-css theme-tint"></div>
        <div className="canvas-container">
          <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.5, 6], fov: 65 }}>
            <ambientLight intensity={0.5} />
            <RainbowRoad speed={speedBoost ? 18 : 0.8} />
          </Canvas>
        </div>
      </div>

      {/* 2. HUD Haut (Toad Bank) */}
      <ToadBank />

      {/* 3. Contenu Principal défilant (Zone Mobile) */}
      <main className="content-area">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            {renderPage()}
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      {/* 4. Bouton Retour Global (Visible hors du Home) */}
      <AnimatePresence>
        {currentPage !== 'HOME' && (
          <motion.button
            className="global-home-btn"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => setPage('HOME')}
          >
            🏠
          </motion.button>
        )}
      </AnimatePresence>

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
        .background-layer { 
          position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: -10; 
          background-image: radial-gradient(circle at center 30%, var(--theme-glow, rgba(0,255,204,0.2)) 0%, transparent 80%);
          transition: background-image 0.5s ease-in-out;
        }

        .theme-tint {
          background-color: var(--theme-glow, rgba(0,255,204,0.2));
          mix-blend-mode: color;
          transition: background-color 0.5s ease-in-out;
        }
        
        .stars-css {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1px 1px at 40px 70px, rgba(255,255,255,0.8), rgba(0,0,0,0));
        }

        .canvas-container {
          width: 100%; height: 100%; position: absolute;
          -webkit-mask-image: linear-gradient(to top, black 30%, transparent 80%);
          mask-image: linear-gradient(to top, black 30%, transparent 80%);
        }

        .content-area {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: calc(var(--safe-top) + var(--header-height) + 20px) 20px calc(var(--safe-bottom) + var(--tab-height) + 20px) 20px;
          position: relative; z-index: 10; pointer-events: none;
        }
        .content-area > * { pointer-events: auto; width: 100%; max-width: 450px; }

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
    </div>
  );
}
