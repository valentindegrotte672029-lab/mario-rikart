/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { socket } from '../socket';
import NeonIcon from './NeonIcon';
import PsychContent from './PsychContent';
import CemantixContent from './CemantixContent';

const BG_ASSET_VERSION = '20260317a';

export default function PageWaluigi() {
  const { 
    spendCoins, 
    setBgOverride, 
    clearBgOverride, 
    waluigiView, 
    setWaluigiView, 
    gourdasseUnlock, 
    setGourdasseUnlock 
  } = useStore();
  
  const [orderQr, setOrderQr] = useState(null);

  const THEMES = {
    BAR: {
        glow: '#9900ff',
        glowSoft: 'rgba(153, 0, 255, 0.30)',
        bg: `linear-gradient(145deg, rgba(153,0,255,0.22), rgba(15,0,25,0.92)), url('/images/backgrounds/bg_wario_gold_v3.png?v=${BG_ASSET_VERSION}')`,
    },
    TEST: {
        glow: '#00CED1',
        glowSoft: 'rgba(0, 206, 209, 0.32)',
        bg: `linear-gradient(145deg, rgba(0,206,209,0.25), rgba(0,15,20,0.93)), url('/images/backgrounds/bg_psych_neural_v2.jpg?v=${BG_ASSET_VERSION}')`,
    },
    MOTUS: {
        glow: '#ffcc00',
        glowSoft: 'rgba(255, 204, 0, 0.30)',
        bg: `linear-gradient(145deg, rgba(255,204,0,0.20), rgba(15,8,0,0.94)), url('/images/backgrounds/bg_toadxique_potions_v3.png?v=${BG_ASSET_VERSION}')`,
    }
  };

  useEffect(() => {
    const theme = THEMES[waluigiView] || THEMES.BAR;
    setBgOverride(theme);
  }, [waluigiView, setBgOverride]);

  const CategoryTabBar = () => (
    <div className="category-tab-bar">
      <button 
        className={`category-tab ${waluigiView === 'BAR' ? 'active bar' : ''}`} 
        onClick={() => setWaluigiView('BAR')}
      >
        <NeonIcon name="waluigi-transparent" size={16} /> BAR
      </button>
      <button 
        className={`category-tab ${waluigiView === 'TEST' ? 'active test' : ''}`} 
        onClick={() => setWaluigiView('TEST')}
      >
        <NeonIcon name="Test icône" size={16} /> TEST
      </button>
      <button 
        className={`category-tab ${waluigiView === 'MOTUS' ? 'active motus' : ''}`} 
        onClick={() => setWaluigiView('MOTUS')}
      >
        <NeonIcon name="motus-neon" size={16} /> MOTUS
      </button>
    </div>
  );

  const menu = [
    { id: 'gourd-50', name: 'Gourdasse 50cc', price: 1500, icon: 'flask-purple-atomic' },
    { id: 'gourd-100', name: 'Gourdasse 100cc', price: 2000, icon: 'flask-orange-distill' },
    { id: 'gourd-150', name: 'Gourdasse 150cc', price: 2500, icon: 'flask-green-erlenmeyer' },
  ];

  const handleBuy = (item) => {
    const tiers = ['gourd-50', 'gourd-100', 'gourd-150'];
    const currentTierIdx = tiers.indexOf(gourdasseUnlock);
    const targetTierIdx = tiers.indexOf(item.id);

    if (gourdasseUnlock && targetTierIdx <= currentTierIdx) {
      if (window.navigator?.vibrate) window.navigator.vibrate(200);
      return;
    }

    const previousPrice = currentTierIdx === -1 ? 0 : menu[currentTierIdx].price;
    const finalCost = item.price - previousPrice;

    const success = spendCoins(finalCost, item.name.toUpperCase());
    if (!success) {
      if (window.navigator?.vibrate) window.navigator.vibrate(200);
      return;
    }

    if (window.navigator?.vibrate) window.navigator.vibrate([30, 50, 30]);
    setGourdasseUnlock(item.id);

    socket.emit('new_order', {
      item: item.name,
      price: finalCost,
      id: item.id,
      username: useStore.getState().username,
      note: gourdasseUnlock ? `UPGRADE depuis ${menu[currentTierIdx].name} (-${previousPrice})` : 'PREMIER ACHAT GOURDASSE'
    });

    setOrderQr(`WLU - ${Math.random().toString(36).substring(7).toUpperCase()} `);
  };

  const renderContent = () => {
    switch(waluigiView) {
        case 'TEST': return <PsychContent />;
        case 'MOTUS': return <CemantixContent />;
        default: return (
            <div className="glass-panel mobile-card waluigi-card">
                <h1 className="title-mobile waluigi-title">WALUIGI-BARNAQUE</h1>
                <p className="waluigi-motto">"Tu vas raquer, c'est WALUIGI TIME !"</p>

                <div className="ios-list">
                {menu.map((item, index) => {
                    const tiers = ['gourd-50', 'gourd-100', 'gourd-150'];
                    const currentTierIdx = tiers.indexOf(gourdasseUnlock);
                    const targetTierIdx = tiers.indexOf(item.id);
                    const isOwned = gourdasseUnlock === item.id;
                    const isUpgrade = gourdasseUnlock && targetTierIdx > currentTierIdx;
                    
                    const prevPrice = currentTierIdx === -1 ? 0 : menu[currentTierIdx].price;
                    const displayPrice = isUpgrade ? item.price - prevPrice : item.price;

                    return (
                    <div key={item.id} className={`ios-item ${isOwned ? 'owned' : ''}`}>
                        <div className="ios-icon">
                            <NeonIcon name={item.icon} size={28} />
                        </div>
                        <div className="ios-info">
                            <div className="ios-name">{item.name}</div>
                            <div className="ios-sub">{isOwned ? 'POSSÉDÉ' : isUpgrade ? 'UPGRADE' : 'BLOQUÉ'}</div>
                        </div>
                        <button 
                            className={`ios-buy-btn ${isOwned ? 'owned' : ''}`}
                            onClick={() => handleBuy(item)}
                        >
                        {isOwned ? 'FREE' : `${displayPrice} `}
                        </button>
                    </div>
                    );
                })}
                </div>

                <div className="waluigi-footer">
                {orderQr ? (
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="qr-container">
                        <div className="qr-box">
                            <span className="qr-text">{orderQr}</span>
                        </div>
                        <p className="qr-hint">PRÉSENTE CE CODE AU COMPTOIR</p>
                    </motion.div>
                ) : (
                    <div className="waluigi-info-box">
                    <p>Mélange tes propres breuvages et gagne en puissance.</p>
                    </div>
                )}
                </div>
            </div>
        );
    }
  };

  return (
    <div className="page-mobile hub-mobile">
      <CategoryTabBar />
      <AnimatePresence mode="wait">
        <motion.div
            key={waluigiView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ width: '100%', maxWidth: '450px' }}
        >
            {renderContent()}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .hub-mobile {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: calc(var(--safe-top) + 15px) 15px 120px 15px;
        }

        .category-tab-bar {
          display: flex;
          width: 100%;
          max-width: 450px;
          gap: 4px;
          margin-bottom: 25px;
          padding: 0 4px;
          z-index: 1000;
        }
        .category-tab {
          flex: 1 1 0%;
          min-width: 0;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 12px;
          padding: 10px 4px;
          color: #999;
          font-weight: 900;
          font-size: 0.68rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .category-tab.active.bar {
          background: rgba(153, 0, 255, 0.2) !important;
          border-color: #9900ff !important;
          color: white;
          box-shadow: 0 0 15px rgba(153, 0, 255, 0.3);
        }
        .category-tab.active.test {
          background: rgba(0, 206, 209, 0.2) !important;
          border-color: #00ced1 !important;
          color: white;
          box-shadow: 0 0 15px rgba(0, 206, 209, 0.3);
        }
        .category-tab.active.motus {
          background: rgba(255, 204, 0, 0.2) !important;
          border-color: #ffcc00 !important;
          color: white;
          box-shadow: 0 0 15px rgba(255, 204, 0, 0.3);
        }

        .waluigi-card { border: 1px solid rgba(153, 0, 255, 0.3); }
        .waluigi-title { color: #9900ff; text-shadow: 0 0 15px rgba(153, 0, 255, 0.4); margin-bottom: 2px; }
        .waluigi-motto { font-style: italic; color: #888; font-size: 0.8rem; text-align: center; margin-bottom: 25px; }

        .ios-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 30px; }
        .ios-item { 
            display: flex; align-items: center; gap: 15px; padding: 12px;
            background: rgba(255,255,255,0.03); border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.05); transition: all 0.2s;
        }
        .ios-item.owned { border-color: rgba(153, 0, 255, 0.3); background: rgba(153, 0, 255, 0.05); }
        .ios-icon { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border-radius: 12px; }
        .ios-info { flex: 1; }
        .ios-name { font-weight: bold; color: white; font-size: 1rem; }
        .ios-sub { font-size: 0.7rem; color: #888; text-transform: uppercase; margin-top: 2px; }
        .ios-buy-btn { 
            padding: 8px 15px; border-radius: 20px; border: none; 
            background: #9900ff; color: white; font-weight: bold; font-size: 0.85rem;
            box-shadow: 0 4px 15px rgba(153, 0, 255, 0.3);
            cursor: pointer;
        }
        .ios-buy-btn.owned { background: #333; color: #888; box-shadow: none; opacity: 0.6; }

        .qr-container { text-align: center; margin-top: 10px; }
        .qr-box { 
            background: white; padding: 15px; border-radius: 15px; display: inline-block;
            margin-bottom: 10px; box-shadow: 0 0 20px rgba(153, 0, 255, 0.3);
        }
        .qr-text { color: black; font-family: monospace; font-weight: bold; font-size: 1.2rem; }
        .qr-hint { font-size: 0.7rem; color: #9900ff; font-weight: 800; letter-spacing: 1px; }

        .waluigi-info-box { padding: 15px; background: rgba(255,255,255,0.03); border-radius: 12px; text-align: center; color: #888; font-size: 0.8rem; }
        
        /* Styles Psych & Motus persistants */
        .psych-tab-bar { display: flex; gap: 8px; margin-bottom: 16px; width: 100%; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .psych-tab { flex: 1; padding: 12px 0; border: none; background: transparent; color: #888; font-weight: bold; cursor: pointer; transition: 0.2s; }
        .psych-tab.active { color: var(--psych-accent, #00ffff); border-bottom: 2px solid var(--psych-accent, #00ffff); text-shadow: 0 0 10px var(--psych-accent); }
      `}</style>
    </div>
  );
}
