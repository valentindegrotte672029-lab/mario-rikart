import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, RefreshCcw } from 'lucide-react';
import useStore from '../store/useStore';
import NeonIcon from './NeonIcon';
import ComingSoon from './ComingSoon';

export default function PageChrono() {
    const [status, setStatus] = useState('idle'); // 'idle', 'running', 'alarm'
    const timerRef = useRef(null);
    const audioCtxRef = useRef(null);
    const oscillatorRef = useRef(null);

    // Global Audio Unlocker for iOS
    useEffect(() => {
        const unlockAudio = () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            document.removeEventListener('pointerdown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
        document.addEventListener('pointerdown', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        return () => {
            document.removeEventListener('pointerdown', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        };
    }, []);

    const playSiren = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Siren effect (frequency modulation)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);

        // Loop frequency up and down for a harsh alarm
        for (let i = 0; i < 20; i++) {
            osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + i * 0.5 + 0.25);
            osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + i * 0.5 + 0.5);
        }

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;
    };

    const stopSiren = () => {
        if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
        }
    };

    const startChrono = () => {
        if (window.navigator?.vibrate) window.navigator.vibrate(50);
        setStatus('running');

        // Unlock AudioContext on iOS right during user interaction
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();
        
        // Play silent dummy sound to unlock audio
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(0.1);

        // Durée aléatoire entre 5s et 1 minute (Calculée à chaque clic)
        const randomDuration = Math.floor(Math.random() * (60000 - 5000 + 1)) + 5000;

        timerRef.current = setTimeout(() => {
            setStatus('alarm');
            playSiren();
            if (window.navigator?.vibrate) {
                window.navigator.vibrate([500, 200, 500, 200, 1000]); // Grosse vibration
            }
        }, randomDuration);
    };

    const resetChrono = () => {
        clearTimeout(timerRef.current);
        stopSiren();
        setStatus('idle');
        if (window.navigator?.vibrate) window.navigator.vibrate(20);
    };

    useEffect(() => {
        return () => {
            clearTimeout(timerRef.current);
            stopSiren();
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    const setPage = useStore(s => s.setPage);

    const CategoryTabBar = () => (
        <div className="category-tab-bar">
            <button className="category-tab" onClick={() => setPage('TOAD')}>
                <NeonIcon name="Toad icône" size={18} /> TOAD-XIQUE
            </button>
            <button className="category-tab active" onClick={() => setPage('CHRONO')}>
                <NeonIcon name="Poppy icône" size={18} /> POPPY
            </button>
        </div>
    );

    return (
        <motion.div
            className={`page-mobile chrono-mobile ${status}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            <CategoryTabBar />
            <div className="glass-panel mobile-card chrono-card">
                {!useStore.getState().featureFlags.toadLab ? (
                    <ComingSoon title="Poppy" minimal={true} color="#ff9900" />
                ) : (
                <>
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
                                <Timer size={100} color="#ffbb00" />
                                <span>LANCER<br /><small style={{ fontSize: '0.8rem', opacity: 0.8 }}>(5s - 1min)</small></span>
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
                                <span style={{ fontSize: '3.5rem' }}>💣</span>
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
                            <AlertTriangle size={120} color="#ff0000" />
                            <h1 className="alarm-title">STOP !</h1>
                            <p className="alarm-subtitle">Le dernier qui a pris a perdu !</p>

                            <button className="btn-secondary mt-20" onClick={resetChrono}>
                                <RefreshCcw size={20} /> Recommencer
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
                </>
                )}
            </div>

            <style>{`
        .chrono-mobile {
          --theme-color: #ff9900;
          width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; position: relative;
          transition: background-color 0.5s ease;
        }

        .category-tab-bar {
          display: flex;
          width: 100%;
          max-width: 450px;
          gap: 10px;
          margin-bottom: 15px;
          padding: 0 5px;
        }
        .category-tab {
          flex: 1;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 15px;
          padding: 12px;
          color: #aaa;
          font-weight: 800;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .category-tab.active {
          background: rgba(255, 153, 0, 0.2) !important;
          border-color: #ff9900 !important;
          color: white;
          box-shadow: 0 0 15px rgba(255, 153, 0, 0.3);
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
          width: 100%; aspect-ratio: 1; max-width: 250px; border-radius: 0;
          background: transparent !important; border: none !important; color: white;
          font-size: 1.2rem; font-weight: bold; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
          box-shadow: none !important; transition: transform 0.1s;
          text-shadow: 0 0 10px rgba(255,153,0,0.8);
        }
        .huge-chrono-btn:active { transform: scale(0.95); }

        .pulsing-bomb {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-bottom: 25px;
          /* Premium Integration Glow */
          background: radial-gradient(circle, rgba(255, 60, 0, 0.15) 0%, transparent 70%);
          border-radius: 50%;
        }
        
        /* The glow is now handled primarily by NeonIcon's improved drop-shadows, 
           but we add a secondary layer for the 'premium' feel */
        .running-text { font-size: 1.5rem; color: #ff5555; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; text-shadow: 0 0 10px rgba(255,0,0,0.4); }
        .tension-text { color: #888; font-style: italic; }

        .alarm-container { animation: shakeHard 0.1s infinite alternate; }
        .alarm-title { font-size: 4rem; color: white; font-weight: 900; letter-spacing: 5px; margin: 10px 0; text-shadow: 0 0 30px red; }
        .alarm-subtitle { font-size: 1.2rem; color: #ffaaaa; }
        
        .mt-20 { margin-top: 30px; }
        .btn-secondary { background: transparent !important; color: white; border: none !important; padding: 15px 30px; border-radius: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; font-weight: bold; box-shadow: none !important; }

        @keyframes shakeHard { 0% { transform: translate(3px, 5px) rotate(1deg); } 100% { transform: translate(-3px, -5px) rotate(-1deg); } }
      `}</style>
        </motion.div>
    );
}
