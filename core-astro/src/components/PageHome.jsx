import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, Zap, Flame, Camera, Beer, Timer, Brain, Gem, Spade } from 'lucide-react';
import useStore from '../store/useStore';

export default function PageHome() {
  const { setPage } = useStore();

  const apps = [
    { id: 'LUIGI', icon: Beaker, label: 'Arcade', color: '#39ff14', bg: 'linear-gradient(135deg, #0f380f, #1a4a1a)' },
    { id: 'MARIO', icon: Camera, label: 'BeMario', color: '#ff3333', bg: 'linear-gradient(135deg, #4a0f0f, #8a1a1a)' },
    { id: 'WARIO', icon: Beer, label: 'Barnaque', color: '#ffcc00', bg: 'linear-gradient(135deg, #111111, #332200)' },
    { id: 'PEACH', icon: Flame, label: 'Peachasse', color: '#ff66b2', bg: 'linear-gradient(135deg, #4a0f38, #8a1a66)' },
    { id: 'TOAD', icon: Zap, label: 'Toad Bank', color: '#9933ff', bg: 'linear-gradient(135deg, #2a0f4a, #5a1a8a)' },
    { id: 'CHRONO', icon: Timer, label: 'Poppy', color: '#ff9900', bg: 'linear-gradient(135deg, #4a2a0f, #8a4a1a)' },
    { id: 'PSYCH', icon: Brain, label: 'Le Test', color: '#00ffff', bg: 'linear-gradient(135deg, #0f4a4a, #1a8a8a)' },
    { id: 'CASINO', icon: Gem, label: 'Paris IRL', color: '#ff00ff', bg: 'linear-gradient(135deg, #4a0f4a, #8a1a8a)' },
    { id: 'POKER', icon: Spade, label: 'Poker', color: '#00ff66', bg: 'linear-gradient(135deg, #0a3a0a, #1a5a1a)' },
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
            <div className="app-icon" style={{ background: app.bg, border: `1px solid ${app.color}40` }}>
              <app.icon size={36} color={app.color} strokeWidth={1.5} />
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
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
          margin-bottom: 8px;
          position: relative;
          overflow: hidden;
        }
        
        .app-icon::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0));
          border-radius: 20px 20px 0 0;
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
