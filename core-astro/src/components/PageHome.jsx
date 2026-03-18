import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';
import NeonIcon from './NeonIcon';

export default function PageHome() {
  const { setPage } = useStore();

  const apps = [
    { id: 'LUIGI', icon: 'ticket-gold', label: 'Arcade', color: '#39ff14' },
    { id: 'MARIO', icon: 'camera-neon', label: 'BeMario', color: '#ff3333' },
    { id: 'WARIO', icon: 'devil-neon', label: 'Barnaque', color: '#ffcc00' },
    { id: 'PEACH', icon: 'crown-neon', label: 'Peachasse', color: '#ff66b2' },
    { id: 'TOAD', icon: 'skull-neon', label: 'Toad Bank', color: '#9933ff' },
    { id: 'CHRONO', icon: 'bomb-timer', label: 'Poppy', color: '#ff9900' },
    { id: 'PSYCH', icon: 'books-neon', label: 'Le Test', color: '#00ffff' },
    { id: 'CASINO', icon: 'key-neon', label: 'Paris IRL', color: '#ff00ff' },
    { id: 'POKER', icon: 'guitar-neon', label: 'Poker', color: '#00ff66' },
  ];

  return (
    <motion.div
      className="page-mobile home-mobile float-subtle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="home-header">
        <h1 className="text-gradient">V2026</h1>
        <p>Mario Rikart Experience</p>
      </div>

      <div className="apps-grid">
        {apps.map(app => (
          <motion.div
            key={app.id}
            className="app-icon-container"
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (window.navigator?.vibrate) window.navigator.vibrate(50);
              setPage(app.id);
            }}
          >
            <div className="app-icon">
              <NeonIcon name={app.icon} size={30} glow={app.color} />
            </div>
            <span className="app-label">{app.label}</span>
          </motion.div>
        ))}
      </div>

      <style>{`
        .home-mobile {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 50px;
        }

        .home-header {
          text-align: center;
          margin-bottom: 50px;
          background: rgba(0,0,0,0.5);
          padding: 20px 40px;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
        }

        .apps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px 20px;
          width: 100%;
          max-width: 400px;
          padding: 0 20px;
        }

        .app-icon-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .app-icon {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .app-label {
          color: white;
          font-size: 0.8rem;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.8);
          letter-spacing: 0.5px;
        }
      `}</style>
    </motion.div>
  );
}
