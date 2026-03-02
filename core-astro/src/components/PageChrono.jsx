import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, RefreshCcw } from 'lucide-react';

export default function PageChrono() {
    const [status, setStatus] = useState('idle'); // 'idle', 'running', 'alarm'
    const timerRef = useRef(null);

    const startChrono = () => {
        if (window.navigator?.vibrate) window.navigator.vibrate(50);
        setStatus('running');

        // Durée aléatoire entre 30s et 1 minute
        const randomDuration = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000;

        timerRef.current = setTimeout(() => {
            setStatus('alarm');
            if (window.navigator?.vibrate) {
                window.navigator.vibrate([500, 200, 500, 200, 1000]); // Grosse vibration
            }
        }, randomDuration);
    };

    const resetChrono = () => {
        clearTimeout(timerRef.current);
        setStatus('idle');
        if (window.navigator?.vibrate) window.navigator.vibrate(20);
    };

    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    return (
        <motion.div
            className={`page-mobile chrono-mobile ${status}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            <div className="glass-panel mobile-card chrono-card">
                <h1 className="title-mobile chrono-title">CHRONO POPPY</h1>

                <AnimatePresence mode="wait">
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="state-container"
                        >
                            <p className="desc">Lance le minuteur aveugle. Prenez du poppy jusqu'à ce que l'alarme sonne !</p>
                            <button className="huge-chrono-btn" onClick={startChrono}>
                                <Timer size={60} />
                                <span>LANCER<br /><small style={{ fontSize: '0.8rem', opacity: 0.8 }}>(30s - 1min)</small></span>
                            </button>
                        </motion.div>
                    )}

                    {status === 'running' && (
                        <motion.div
                            key="running"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }}
                            className="state-container"
                        >
                            <motion.div
                                className="pulsing-bomb"
                                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            >
                                💣
                            </motion.div>
                            <h2 className="running-text">C'est parti ! Prenez, prenez, prenez !</h2>
                            <p className="tension-text">L'alarme peut sonner à tout moment...</p>
                        </motion.div>
                    )}

                    {status === 'alarm' && (
                        <motion.div
                            key="alarm"
                            initial={{ opacity: 0, scale: 1.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                            className="state-container alarm-container"
                        >
                            <AlertTriangle size={80} color="#fff" />
                            <h1 className="alarm-title">STOP !</h1>
                            <p className="alarm-subtitle">Le dernier qui a pris a perdu !</p>

                            <button className="btn-secondary mt-20" onClick={resetChrono}>
                                <RefreshCcw size={20} /> Recommencer
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
        .chrono-mobile {
          --theme-color: #ff9900;
          width: 100%; height: 100%; display: flex; align-items: center; position: relative;
          transition: background-color 0.5s ease;
        }

        .chrono-mobile.alarm { background: rgba(255, 0, 0, 0.4); animation: bgFlash 0.5s infinite alternate; }

        @keyframes bgFlash { 0% { background: rgba(255, 0, 0, 0.4); } 100% { background: rgba(255, 100, 0, 0.6); } }

        .chrono-card {
          width: 100%; padding: 30px 20px; border-radius: 32px;
          border-color: rgba(255, 153, 0, 0.3); background: rgba(20, 10, 0, 0.7);
          text-align: center;
        }

        .chrono-title { font-size: 2.2rem; color: #ffbb00; font-weight: 900; margin-bottom: 20px; text-shadow: 0 0 15px rgba(255,153,0,0.5); }
        .desc { color: #ccc; margin-bottom: 30px; font-size: 1rem; line-height: 1.4; }
        
        .state-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 250px; }

        .huge-chrono-btn {
          width: 100%; aspect-ratio: 1; max-width: 250px; border-radius: 50%;
          background: linear-gradient(135deg, #ff9900, #cc5500); border: none; color: white;
          font-size: 1.2rem; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 10px 30px rgba(204, 85, 0, 0.5); transition: transform 0.1s;
        }
        .huge-chrono-btn:active { transform: scale(0.95); }

        .pulsing-bomb { font-size: 6rem; filter: drop-shadow(0 0 20px red); margin-bottom: 20px; }
        .running-text { font-size: 1.5rem; color: #ff5555; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
        .tension-text { color: #888; font-style: italic; }

        .alarm-container { animation: shakeHard 0.1s infinite alternate; }
        .alarm-title { font-size: 4rem; color: white; font-weight: 900; letter-spacing: 5px; margin: 10px 0; text-shadow: 0 0 30px red; }
        .alarm-subtitle { font-size: 1.2rem; color: #ffaaaa; }
        
        .mt-20 { margin-top: 30px; }
        .btn-secondary { background: rgba(255,255,255,0.1); color: white; border: none; padding: 15px 30px; border-radius: 20px; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }

        @keyframes shakeHard { 0% { transform: translate(3px, 5px) rotate(1deg); } 100% { transform: translate(-3px, -5px) rotate(-1deg); } }
      `}</style>
        </motion.div>
    );
}
