/* eslint-disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, Timer } from 'lucide-react';
import useStore from '../../store/useStore';
import { socket } from '../../socket';
import NeonIcon from '../NeonIcon';

const GAME_DURATION = 20; // 20 seconds of intense clicking
const SPAWN_INTERVAL_MS = 450; // Slower/Simpler
const REWARD_MULTIPLIER = 0.6;

export default function ChampiNinja({ onExit }) {
    const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [items, setItems] = useState([]); // { id, x, y, type: 'champi' | 'bomb', velocityY }

    const requestRef = useRef();
    const spawnTimerRef = useRef();
    const itemIdCounter = useRef(0);

    // --- GAME LOOP LOGIC ---
    const updateGame = useCallback(() => {
        if (gameState !== 'PLAYING') return;

        setItems((currentItems) => {
            // Move items up (they jump)
            const updatedItems = currentItems.map(item => ({
                ...item,
                y: item.y - item.velocityY,
                velocityY: item.velocityY - 0.70 // High Gravity effect
            }));

            // Filter out items that fell below the screen (approx 600px)
            return updatedItems.filter(item => item.y < 650);
        });

        requestRef.current = requestAnimationFrame(updateGame);
    }, [gameState]);

    // --- SPAWN LOGIC ---
    const spawnItem = useCallback(() => {
        if (gameState !== 'PLAYING') return;

        // Probabilities: 75% Champi, 20% Bomb, 5% Golden
        const rng = Math.random();
        let type = 'champi';
        if (rng > 0.95) type = 'golden';
        else if (rng > 0.75) type = 'bomb';

        const newItem = {
            id: itemIdCounter.current++,
            x: Math.random() * 80 + 10, // 10% to 90% view width
            y: 550, // Spawn from bottom
            type: type,
            velocityY: Math.random() * 7 + 17, // Slower jump strength
            rotation: Math.random() * 360,
        };

        setItems(prev => [...prev, newItem]);
    }, [gameState]);

    // --- LIFECYCLE ---
    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(updateGame);
            spawnTimerRef.current = setInterval(spawnItem, SPAWN_INTERVAL_MS);

            const countdown = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        endGame();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => {
                cancelAnimationFrame(requestRef.current);
                clearInterval(spawnTimerRef.current);
                clearInterval(countdown);
            };
        }
    }, [gameState, updateGame, spawnItem]);

    // --- INTERACTIONS ---
    const startGame = () => {
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setItems([]);
        setGameState('PLAYING');
    };

    const endGame = () => {
        setGameState('GAMEOVER');
        setItems([]); // CLEAR ITEMS IMMEDIATELY
        if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);

        setScore(currentScore => {
            if (currentScore > 0) {
                const totalReward = Math.floor(currentScore * REWARD_MULTIPLIER);
                useStore.setState(state => ({ balance: state.balance + totalReward }));
                socket.emit('submit_score', { game: 'CHAMPININJA', score: currentScore });
            }
            return currentScore;
        });
    };

    const handleSlice = (id, type) => {
        if (gameState !== 'PLAYING') return;

        if (window.navigator?.vibrate) window.navigator.vibrate(40);

        if (type === 'bomb') {
            if (window.navigator?.vibrate) window.navigator.vibrate([150, 50, 150]);
            setScore(prev => Math.max(0, prev - 50)); // Heavy Penality
        } else if (type === 'golden') {
            setScore(prev => prev + 25); // Big reward
        } else {
            setScore(prev => prev + 5); // Normal Reward
        }

        // Remove item
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const getItemIcon = (type) => {
        if (type === 'bomb') return <span style={{ fontSize: '45px', filter: 'drop-shadow(0 0 10px red)' }}>💣</span>;
        if (type === 'golden') return <span style={{ fontSize: '50px', filter: 'drop-shadow(0 0 15px gold)' }}>🌟</span>;
        return <span style={{ fontSize: '45px', filter: 'drop-shadow(0 0 10px #ff3366)' }}>🍄</span>;
    };

    // --- RENDERING ---
    return (
        <motion.div
            className="page-mobile champininja-mobile"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <div className="header-nav">
                <button className="back-btn" onClick={onExit}><ArrowLeft size={24} /></button>
                <h2>CHAMPI NINJA</h2>
                <div className="score-display">
                    <Coins size={16} color="#ffcc00" /> {Math.floor(score * REWARD_MULTIPLIER)}
                </div>
            </div>

            <div className="game-container">
                {/* HUD Timer */}
                {gameState === 'PLAYING' && (
                    <div className="timer-hud">
                        <Timer size={20} /> <span>{timeLeft}s</span>
                    </div>
                )}

                {gameState === 'START' && (
                    <div className="overlay-menu">
                        <h1>Slash rapide !</h1>
                        <div className="overlay-text">Tape sur les 🍄 pour scorrer.</div>
                        <div className="overlay-text secondary">Attention aux bombes 💣 !</div>
                        <button className="start-btn" onClick={startGame}>JOUER (20s)</button>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="overlay-menu">
                        <h1>TERMINE</h1>
                        <div className="overlay-text">Score : {score} pts</div>
                        <div className="overlay-text">Total récolté : <strong style={{ color: '#ffcc00' }}>{Math.floor(score * REWARD_MULTIPLIER)} <NeonIcon name="coin-gold" size={18} /></strong></div>
                        <button className="start-btn" onClick={startGame} style={{ marginTop: '20px' }}>REJOUER</button>
                    </div>
                )}

                {/* Play Area */}
                <div className="play-area">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                className={`ninja-item ${item.type}`}
                                style={{
                                    left: `${item.x}%`,
                                    top: `${item.y}px`,
                                }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, rotate: item.rotation + (item.velocityY * 5) }}
                                exit={{ scale: 1.5, opacity: 0, filter: 'brightness(2)' }}
                                onPointerDown={(e) => {
                                    e.preventDefault();
                                    handleSlice(item.id, item.type);
                                }}
                                onPointerEnter={(e) => {
                                    if (e.buttons === 1) { // 1 = Left mouse button held
                                        handleSlice(item.id, item.type);
                                    }
                                }}
                            >
                                {getItemIcon(item.type)}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <p style={{ textAlign: 'center', color: '#888', marginTop: '10px' }}>Tapote ou glisse sur les champignons.</p>

            <style>{`
                .champininja-mobile {
                    --theme-color: #ff3366;
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    width: 100vw; height: 100vh; height: 100dvh;
                    display: flex; flex-direction: column;
                    align-items: center;
                    background-color: #110000;
                    background-image: radial-gradient(circle at center, #330011 0%, #110000 100%);
                    z-index: 9999;
                    padding: calc(env(safe-area-inset-top, 0px) + 85px) 15px 15px 15px;
                    box-sizing: border-box;
                }

                .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: var(--theme-color); width: 100%; max-width: 450px; }
                .back-btn { background: rgba(255,255,255,0.1); border: none; padding: 10px; border-radius: 50%; color: white; display: flex; }
                .score-display { display: flex; align-items: center; gap: 5px; font-weight: 900; background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 20px; border: 1px solid var(--theme-color); color: white; font-size: 1.1rem; }

                .game-container {
                    flex: 1; position: relative; width: 100%; max-width: 450px;
                    background: rgba(0,0,0,0.6); border-radius: 30px; border: 2px solid var(--theme-color);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 0 30px rgba(255, 51, 102, 0.2);
                    overflow: hidden; touch-action: none;
                }

                .timer-hud {
                    position: absolute; top: 15px; right: 15px; z-index: 5;
                    display: flex; align-items: center; gap: 8px;
                    color: white; font-weight: 900; font-size: 1.3rem;
                    background: rgba(255, 51, 102, 0.3); padding: 8px 15px; border-radius: 12px;
                    border: 1px solid var(--theme-color);
                }

                .overlay-menu { position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.9); z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px; }
                .overlay-menu h1 { color: var(--theme-color); font-size: 2.8rem; margin-bottom: 15px; text-shadow: 0 0 20px var(--theme-color); font-weight: 900; }
                .overlay-text { color: white; margin-bottom: 8px; font-size: 1.3rem; font-weight: bold; }
                .overlay-text.secondary { color: #888; font-size: 1rem; margin-bottom: 30px; }
                .start-btn { background: var(--theme-color); color: white; font-weight: 900; font-size: 1.4rem; padding: 18px 45px; border-radius: 40px; border: none; box-shadow: 0 0 25px var(--theme-color); cursor: pointer; }

                .play-area {
                    width: 100%; height: 100%; position: relative;
                }

                .ninja-item {
                    position: absolute; width: 70px; height: 70px;
                    display: flex; justify-content: center; align-items: center;
                    cursor: pointer; user-select: none;
                    transform-origin: center;
                    z-index: 10;
                }
                
                .ninja-item.golden { scale: 1.2; }
            `}</style>
        </motion.div >
    );
}
