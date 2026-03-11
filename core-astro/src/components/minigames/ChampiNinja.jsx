/* eslint-disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, Timer } from 'lucide-react';
import useStore from '../../store/useStore';
import { socket } from '../../socket';

const GAME_DURATION = 20; // 20 seconds of intense clicking
const SPAWN_INTERVAL_MS = 600; // Time between spawns

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
                velocityY: item.velocityY - 0.5 // Gravity effect
            }));

            // Remove items that fell out of screen (y > 600)
            return updatedItems.filter(item => item.y < 600);
        });

        requestRef.current = requestAnimationFrame(updateGame);
    }, [gameState]);

    // --- SPAWN LOGIC ---
    const spawnItem = useCallback(() => {
        if (gameState !== 'PLAYING') return;

        const isBomb = Math.random() > 0.7; // 30% chance for a bomb
        const isGolden = !isBomb && Math.random() > 0.9; // 10% chance for golden champi if not bomb

        const newItem = {
            id: itemIdCounter.current++,
            x: Math.random() * 80 + 10, // 10% to 90% view width
            y: 500, // Spawn from bottom
            type: isBomb ? 'bomb' : (isGolden ? 'golden' : 'champi'),
            velocityY: Math.random() * 5 + 15, // Initial jump strength
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
        setScore(currentScore => {
            if (currentScore > 0) {
                useStore.setState(state => ({ balance: state.balance + (currentScore * 5) }));
                socket.emit('submit_score', { game: 'CHAMPININJA', score: currentScore });
            }
            return currentScore;
        });
    };

    const handleSlice = (id, type) => {
        if (gameState !== 'PLAYING') return;

        if (window.navigator?.vibrate) window.navigator.vibrate(50);

        if (type === 'bomb') {
            if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
            setScore(prev => Math.max(0, prev - 100)); // Penality
            // Optional : Flash screen effect ?
        } else if (type === 'golden') {
            setScore(prev => prev + 50); // Big reward
        } else {
            setScore(prev => prev + 10); // Normal Reward
        }

        // Remove item
        setItems(prev => prev.filter(i => i.id !== id));
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
                    <Coins size={16} color="#ffcc00" /> {score * 5}
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
                        <p>Tape sur les 🍄 pour scorrer.</p>
                        <p>Attention aux bombes 💣 !</p>
                        <button className="start-btn" onClick={startGame}>JOUER (20s)</button>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="overlay-menu">
                        <h1>TERMINE</h1>
                        <p>Total récolté : <strong style={{ color: '#ffcc00' }}>{score * 5} 🟡</strong></p>
                        <button className="start-btn" onClick={startGame}>REJOUER</button>
                    </div>
                )}

                {/* Play Area */}
                <div className="play-area">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.button
                                key={item.id}
                                className={`ninja-item ${item.type}`}
                                style={{
                                    left: `${item.x}%`,
                                    top: `${item.y}px`,
                                }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: item.rotation + (item.velocityY * 10) }}
                                exit={{ scale: 0, opacity: 0 }}
                                onPointerDown={(e) => {
                                    e.preventDefault(); // Prevent accidental scrolling
                                    handleSlice(item.id, item.type);
                                }}
                            >
                                {item.type === 'bomb' ? '💣' : (item.type === 'golden' ? '⭐' : '🍄')}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
                .champininja-mobile {
                    --theme-color: #ff3366;
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    width: 100vw; height: 100vh; height: 100dvh;
                    display: flex; flex-direction: column;
                    align-items: center;
                    background-color: #110000;
                    background-image: url('/grain.png'), linear-gradient(135deg, #110000 0%, #330011 100%);
                    background-blend-mode: overlay;
                    z-index: 9999;
                    padding: calc(env(safe-area-inset-top, 0px) + 85px) 15px 15px 15px;
                    box-sizing: border-box;
                }

                .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: var(--theme-color); }
                .back-btn { background: rgba(255,255,255,0.1); border: none; padding: 10px; border-radius: 50%; color: white; display: flex; }
                .score-display { display: flex; align-items: center; gap: 5px; font-weight: bold; background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 20px; border: 1px solid var(--theme-color); color: white; }

                .game-container {
                    flex: 1; position: relative;
                    background: rgba(0,0,0,0.4); border-radius: 20px; border: 2px solid var(--theme-color);
                    box-shadow: inset 0 0 50px rgba(0,0,0,0.8), 0 0 15px rgba(255, 51, 102, 0.3);
                    overflow: hidden; touch-action: none; /* Crucial for swiping/tapping games */
                }

                .timer-hud {
                    position: absolute; top: 15px; right: 15px; z-index: 5;
                    display: flex; align-items: center; gap: 5px;
                    color: white; font-weight: bold; font-size: 1.2rem;
                    background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 10px;
                }

                .overlay-menu { position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.85); z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; }
                .overlay-menu h1 { color: var(--theme-color); font-size: 2.5rem; margin-bottom: 10px; text-shadow: 0 0 15px var(--theme-color); font-family: 'Knewave', cursive; }
                .overlay-menu p { color: white; margin-bottom: 5px; font-size: 1.1rem; }
                .overlay-menu p:last-of-type { margin-bottom: 30px; }
                .start-btn { background: var(--theme-color); color: white; font-weight: bold; font-size: 1.2rem; padding: 15px 40px; border-radius: 30px; border: none; box-shadow: 0 0 15px var(--theme-color); }

                .play-area {
                    width: 100%; height: 100%; position: relative;
                }

                .ninja-item {
                    position: absolute; width: 60px; height: 60px;
                    border: none; background: transparent;
                    font-size: 3rem; display: flex; justify-content: center; align-items: center;
                    cursor: pointer; user-select: none;
                    transform-origin: center;
                }
                
                .ninja-item.golden { filter: drop-shadow(0 0 10px gold); font-size: 3.5rem; }
                .ninja-item.bomb { filter: drop-shadow(0 0 5px red); }
                .ninja-item.champi { filter: drop-shadow(0 0 5px rgba(0,0,0,0.5)); }

            `}</style>
        </motion.div >
    );
}
