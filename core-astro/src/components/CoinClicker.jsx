import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, X } from 'lucide-react';
import useStore from '../store/useStore';

export default function CoinClicker({ onClose }) {
    const { addCoins } = useStore();
    const [timeLeft, setTimeLeft] = useState(10);
    const [score, setScore] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let timer;
        if (isPlaying && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isPlaying) {
            setIsPlaying(false);
            addCoins(score);
        }
        return () => clearInterval(timer);
    }, [isPlaying, timeLeft, score, addCoins]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(10);
        setIsPlaying(true);
    };

    const handleTap = () => {
        if (!isPlaying) return;
        setScore(s => s + 5); // 5 pièces par clic
        if (window.navigator?.vibrate) window.navigator.vibrate(20);
    };

    return (
        <motion.div
            className="clicker-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="clicker-card">
                <button className="close-btn" onClick={onClose}><X size={28} /></button>

                <h2>CASH MACHINE</h2>
                <p>10 secondes pour tapoter un max !</p>

                {!isPlaying && timeLeft === 10 && (
                    <button className="btn-primary start-btn" onClick={startGame}>JOUER</button>
                )}

                {isPlaying && (
                    <div className="game-area">
                        <div className="timer">{timeLeft}s</div>
                        <div className="score">{score} 🟡</div>

                        <motion.button
                            className="tap-target"
                            whileTap={{ scale: 0.9 }}
                            onPointerDown={handleTap}
                        >
                            <Coins size={80} color="#ffcc00" />
                        </motion.button>
                    </div>
                )}

                {!isPlaying && timeLeft === 0 && (
                    <div className="result-area">
                        <h3>TEMPS ÉCOULÉ !</h3>
                        <p>Tu as gagné <strong>{score}</strong> pièces !</p>
                        <button className="btn-primary mt-10" onClick={startGame}>REJOUER</button>
                    </div>
                )}
            </div>

            <style>{`
        .clicker-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          backdrop-filter: blur(10px);
        }
        .clicker-card {
          background: linear-gradient(145deg, #222, #111); border: 2px solid #ffcc00; border-radius: 30px;
          width: 100%; max-width: 350px; padding: 40px 20px; text-align: center; position: relative;
          color: white; box-shadow: 0 10px 40px rgba(255,204,0,0.3);
        }
        .close-btn { position: absolute; top: 15px; right: 15px; background: none; border: none; color: white; opacity: 0.5; padding: 10px; }
        .close-btn:active { opacity: 1; }
        .clicker-card h2 { color: #ffcc00; font-size: 2rem; font-weight: 900; margin-bottom: 5px; text-shadow: 0 0 10px rgba(255,204,0,0.5); }
        .clicker-card p { color: #aaa; margin-bottom: 30px; }
        
        .start-btn { width: 100%; background: #ffcc00; color: #000; font-size: 1.5rem; font-weight: bold; border-radius: 20px; padding: 15px; border: none; }
        .game-area { display: flex; flex-direction: column; align-items: center; gap: 20px; }
        .timer { font-size: 3.5rem; font-weight: bold; color: #ff5555; text-shadow: 0 0 15px rgba(255,85,85,0.5); }
        .score { font-size: 2rem; color: #ffcc00; margin-bottom: 10px; }
        .tap-target { 
          width: 180px; height: 180px; border-radius: 50%; background: linear-gradient(135deg, #444, #222);
          border: 4px solid #ffcc00; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5), inset 0 5px 15px rgba(255,255,255,0.1);
          touch-action: none; user-select: none; -webkit-tap-highlight-color: transparent;
        }
        .result-area h3 { font-size: 1.8rem; color: #4CAF50; margin-bottom: 10px; }
        .result-area strong { color: #ffcc00; font-size: 2rem; display: block; margin: 15px 0; }
        .mt-10 { margin-top: 20px; width: 100%; background: #ffcc00; color: #000; border: none; padding: 15px; border-radius: 20px; font-weight: bold; font-size: 1.2rem; }
      `}</style>
        </motion.div>
    );
}
