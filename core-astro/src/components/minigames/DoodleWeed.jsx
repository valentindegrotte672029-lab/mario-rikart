/* eslint-disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import useStore from '../../store/useStore';

const GRAVITY = 0.4;
const JUMP_FORCE = -10;
const PLATFORM_WIDTH = 60;
const PLATFORM_HEIGHT = 15;
const GAME_WIDTH = window.innerWidth; // Will be constrained by mobile container

export default function DoodleWeed({ onExit }) {
    const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER
    const [score, setScore] = useState(0);

    // Physics State
    const [luigi, setLuigi] = useState({ x: GAME_WIDTH / 2, y: 300, velocityY: 0, velocityX: 0 });
    const [platforms, setPlatforms] = useState([]);
    const [cameraY] = useState(0);

    const endGame = () => {
        setGameState('GAMEOVER');
        if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
        if (score > 0) {
            useStore.setState(state => ({ balance: state.balance + Math.floor(score / 5) })); // Convert score to smaller amount of coins
        }
    };


    const requestRef = useRef();
    const touchXRef = useRef(null);

    // --- INIT MAP ---
    const generateInitialPlatforms = () => {
        let initialPlatforms = [
            { id: 0, x: GAME_WIDTH / 2 - PLATFORM_WIDTH / 2, y: 400, type: 'normal' } // Starting platform
        ];
        // Generate up to y = -1000
        let currentY = 400;
        let idCount = 1;
        while (currentY > -1000) {
            currentY -= Math.random() * 80 + 50; // Distance between platforms
            initialPlatforms.push({
                id: idCount++,
                x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
                y: currentY,
                type: Math.random() > 0.8 ? 'spring' : (Math.random() > 0.9 ? 'breaking' : 'normal')
            });
        }
        return initialPlatforms;
    };

    // --- GAME LOOP ---
    const updateGame = () => {
        if (gameState !== 'PLAYING') return;

        setLuigi((prevLuigi) => {
            let nextY = prevLuigi.y + prevLuigi.velocityY;
            let nextVelocityY = prevLuigi.velocityY + GRAVITY;
            let nextX = prevLuigi.x + prevLuigi.velocityX;

            // Screen Wrap (Left/Right)
            if (nextX < -30) nextX = GAME_WIDTH;
            if (nextX > GAME_WIDTH) nextX = -30;

            // --- COLLISION DETECTION (Only falling down) ---
            if (prevLuigi.velocityY > 0) {
                setPlatforms((currentPlatforms) => {
                    let hit = false;
                    let newPlatforms = [...currentPlatforms];

                    for (let i = 0; i < currentPlatforms.length; i++) {
                        const plat = currentPlatforms[i];
                        // Check collision box
                        if (
                            nextY + 30 >= plat.y && // Bottom of luigi hits top of plat
                            nextY + 30 <= plat.y + PLATFORM_HEIGHT + 10 && // leniency
                            nextX + 30 > plat.x && // Right of luigi past left of plat
                            nextX < plat.x + PLATFORM_WIDTH // Left of luigi before right of plat
                        ) {
                            if (plat.type === 'breaking') {
                                // Break platform
                                newPlatforms = currentPlatforms.filter(p => p.id !== plat.id);
                                hit = false;
                            } else {
                                // BOUNCE
                                hit = true;
                                nextVelocityY = plat.type === 'spring' ? JUMP_FORCE * 1.5 : JUMP_FORCE;
                                if (window.navigator?.vibrate) window.navigator.vibrate(20);
                                break; // Only hit one
                            }
                        }
                    }
                    return newPlatforms;
                });
            }

            // --- CAMERA PANNING & SCORING ---
            // If Luigi goes above middle of screen, pan camera down
            if (nextY < 250) {
                const diff = 250 - nextY;
                nextY = 250; // Keep luigi at 250
                // Move platforms down
                setPlatforms(plats => plats.map(p => ({ ...p, y: p.y + diff })));
                // Score based on height climbed
                setScore(s => s + Math.floor(diff / 10));

                // --- GENERATE NEW PLATFORMS AT TOP ---
                setPlatforms(plats => {
                    const topPlatY = Math.min(...plats.map(p => p.y));
                    if (topPlatY > 0) { // Screen top
                        return [
                            ...plats,
                            {
                                id: Date.now(),
                                x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
                                y: topPlatY - (Math.random() * 80 + 50),
                                type: Math.random() > 0.8 ? 'spring' : (Math.random() > 0.9 ? 'breaking' : 'normal')
                            }
                        ]
                    }
                    // Clean up bottom platforms
                    return plats.filter(p => p.y < 700);
                });
            }

            // --- GAME OVER CONDITION ---
            if (nextY > 650) {
                endGame();
            }

            return { x: nextX, y: nextY, velocityY: nextVelocityY, velocityX: prevLuigi.velocityX };
        });

    };


    useEffect(() => {
        if (gameState === 'PLAYING') {
            requestRef.current = requestAnimationFrame(updateGame);
            return () => cancelAnimationFrame(requestRef.current);
        }
    }, [gameState, updateGame]);


    // --- CONTROLS ---
    // Accelerometer logic
    useEffect(() => {
        const handleMotion = (event) => {
            if (gameState !== 'PLAYING') return;
            const accelerationX = event.accelerationIncludingGravity.x;
            // Depending on OS/Orientation, this might need reversing
            // For standard portrait, tilt right gives positive X
            if (accelerationX !== null) {
                setLuigi(prev => ({ ...prev, velocityX: accelerationX * -1.5 })); // Adjust multiplier for sensitivity
            }
        };

        if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
            // iOS 13+ requires explicit permission, usually triggered by a user action like 'START'
        } else {
            window.addEventListener('devicemotion', handleMotion);
        }

        return () => window.removeEventListener('devicemotion', handleMotion);
    }, [gameState]);

    // Touch fallback for desktop/testing
    const handleTouchStart = (e) => {
        touchXRef.current = e.touches[0].clientX;
    };
    const handleTouchMove = (e) => {
        if (!touchXRef.current || gameState !== 'PLAYING') return;
        const currentX = e.touches[0].clientX;
        const diff = currentX - touchXRef.current;
        setLuigi(prev => ({ ...prev, velocityX: diff > 0 ? 5 : -5 }));
        touchXRef.current = currentX;
    };
    const handleTouchEnd = () => {
        touchXRef.current = null;
        setLuigi(prev => ({ ...prev, velocityX: 0 }));
    };


    // --- ACTIONS ---
    const requestDeviceMotionPermission = async () => {
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceMotionEvent.requestPermission();
                if (permissionState === 'granted') {
                    // Start game after grant
                    startGameInner();
                } else {
                    alert("On a besoin de tes capteurs pour jouer !");
                }
            } catch (error) {
                console.error(error);
                startGameInner(); // Fallback if error but not block
            }
        } else {
            startGameInner();
        }
    };

    const startGameInner = () => {
        setPlatforms(generateInitialPlatforms());
        setLuigi({ x: GAME_WIDTH / 2, y: 300, velocityY: JUMP_FORCE, velocityX: 0 }); // Auto-jump start
        setScore(0);
        setGameState('PLAYING');
    }

    const startGame = () => {
        requestDeviceMotionPermission();
    };


    return (
        <motion.div
            className="page-mobile doodleweed-mobile"
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.4, type: 'spring' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="header-nav">
                <button className="back-btn" onClick={onExit}><ArrowLeft size={24} /></button>
                <h2>DOODLE-WEED</h2>
                <div className="score-display">
                    <Coins size={16} color="#ffcc00" /> {Math.floor(score / 5)} (Sc: {score})
                </div>
            </div>

            <div className="game-container">
                {gameState === 'START' && (
                    <div className="overlay-menu">
                        <h1>Monte le + haut !</h1>
                        <p>Penche ton téléphone (ou swipe) pour diriger Luigi.</p>
                        <p>Ne tombe pas !</p>
                        <button className="start-btn" onClick={startGame}>JOUER</button>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="overlay-menu">
                        <h1>CHUTE</h1>
                        <p>Score: {score}</p>
                        <p>Gains: <strong style={{ color: '#ffcc00' }}>{Math.floor(score / 5)} 🟡</strong></p>
                        <button className="start-btn" onClick={startGame}>REJOUER</button>
                    </div>
                )}

                {/* --- RENDER GAME --- */}
                <div className="play-area">
                    {/* Platforms */}
                    {platforms.map(plat => (
                        <div
                            key={plat.id}
                            className={`platform ${plat.type}`}
                            style={{
                                left: `${plat.x}px`,
                                top: `${plat.y}px`,
                                width: `${PLATFORM_WIDTH}px`,
                                height: `${PLATFORM_HEIGHT}px`
                            }}
                        >
                            {plat.type === 'spring' && <span className="spring-prop">🍄</span>}
                            {plat.type === 'breaking' && <span className="break-prop">🪵</span>}
                        </div>
                    ))}

                    {/* Luigi */}
                    {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
                        <div
                            className="player-luigi"
                            style={{
                                left: `${luigi.x}px`,
                                top: `${luigi.y}px`,
                                transform: `scaleX(${luigi.velocityX < 0 ? -1 : 1})`
                            }}
                        >
                            🧔🏻‍♂️
                        </div>
                    )}
                </div>
            </div >

            <style dangerouslySetInnerHTML={{
                __html: `
                .doodleweed-mobile {
                    --theme-color: #00cc66;
                    width: 100%; height: 100%; display: flex; flex-direction: column;
                    background: url('/grid-paper.png'), linear-gradient(to bottom, #e0ffe0 0%, #a0cca0 100%);
                    background-size: cover;
                    z-index: 50; position: absolute; top:0; left:0;
                    padding: calc(var(--safe-top) + 20px) 15px 15px 15px;
                }

                .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: #114411; }
                .back-btn { background: rgba(0,0,0,0.1); border: none; padding: 10px; border-radius: 50%; color: #114411; display: flex; }
                .score-display { display: flex; align-items: center; gap: 5px; font-weight: bold; background: rgba(255,255,255,0.8); padding: 5px 15px; border-radius: 20px; border: 2px solid #114411; }

                .game-container {
                    flex: 1; position: relative;
                    background: transparent; border-radius: 20px; border: 4px solid #114411;
                    overflow: hidden; touch-action: none;
                }

                .overlay-menu { position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(255,255,255,0.9); z-index: 20; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px; border-radius: 16px; }
                .overlay-menu h1 { color: #114411; font-size: 2.5rem; margin-bottom: 10px; font-family: 'Knewave', cursive; }
                .overlay-menu p { color: #226622; margin-bottom: 5px; font-size: 1.1rem; font-weight: bold; }
                .overlay-menu p:last-of-type { margin-bottom: 30px; }
                .start-btn { background: #114411; color: white; font-weight: bold; font-size: 1.2rem; padding: 15px 40px; border-radius: 30px; border: none; box-shadow: 0 4px 0 #002200; cursor: pointer;}
                .start-btn:active { transform: translateY(4px); box-shadow: 0 0 0 #002200; }

                .play-area {
                    width: 100%; height: 100%; position: relative; overflow: hidden;
                }

                .player-luigi {
                    position: absolute; width: 30px; height: 30px;
                    font-size: 2rem; line-height: 1;
                    transition: transform 0.1s; /* Smooth flip */
                }

                .platform {
                    position: absolute; background: #33aa33; border-radius: 8px;
                    border-bottom: 4px solid #116611;
                }
                .platform.breaking { background: #aa7733; border-bottom: 4px solid #663300; opacity: 0.8; }
                .platform.spring { background: #33aa33; }
                
                .spring-prop { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); font-size: 1.2rem; }
                .break-prop { position: absolute; top: -5px; left: 50%; transform: translateX(-50%); font-size: 1.2rem; opacity: 0.5; }

            `}} />
        </motion.div>
    );
}
