import React from 'react';
import { Home, Beaker, Zap, Flame, Beer, Timer, Camera } from 'lucide-react';
import useStore from '../store/useStore';

export default function TabBar() {
  const { currentPage, setPage } = useStore();

  const tabs = [
    { id: 'HOME', icon: Home, label: 'Hub' },
    { id: 'LUIGI', icon: Beaker, label: 'Luigi' },
    { id: 'TOAD', icon: Zap, label: 'Toad' },
    { id: 'PEACH', icon: Flame, label: 'Peach' },
    { id: 'MARIO', icon: Camera, label: 'Mario' },
    { id: 'WARIO', icon: Beer, label: 'Wario' }, // On distinguera Wario & Mario via couleur
    { id: 'CHRONO', icon: Timer, label: 'Chrono' },
  ];

  // Gestion du boost 3D (Haptic feedback si supporté iOS)
  const handleTabPress = (id) => {
    if (id === currentPage) return;

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50); // Petit retour haptique
    }

    setPage(id);

    setTimeout(() => {
      useStore.getState().resetSpeed();
    }, 800);
  };

  return (
    <div className="tab-bar-container">
      <div className="glass-panel tab-bar-inner">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          return (
            <button
              key={tab.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleTabPress(tab.id)}
            >
              <div className="icon-wrapper">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        .tab-bar-container {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 0 15px calc(var(--safe-bottom) + 15px) 15px;
          z-index: 100;
        }

        .tab-bar-inner {
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 70px;
          border-radius: 35px;
          padding: 0 10px;
        }

        .tab-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #888;
          height: 100%;
          cursor: pointer;
          transition: all 0.2s;
          /* Minimum touch target size Apple */
          min-width: 44px;
        }

        .icon-wrapper {
          position: relative;
          margin-bottom: 4px;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .tab-label {
          font-size: 0.65rem;
          font-weight: 600;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.2s;
        }

        .tab-btn.active {
          color: #fff;
        }

        .tab-btn.active .icon-wrapper {
          transform: translateY(-4px) scale(1.1);
          color: #00ffcc;
          filter: drop-shadow(0 0 8px rgba(0, 255, 204, 0.6));
        }

        .tab-btn.active .tab-label {
          opacity: 1;
          transform: translateY(0);
          color: #00ffcc;
        }
      `}</style>
    </div>
  );
}
