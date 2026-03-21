/* eslint-disable */
import React, { useState, useEffect, useCallback, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import useStore from '../../store/useStore';
import { socket } from '../../socket';
import NeonIcon from '../NeonIcon';

const GRAVITY = 0.55;
const JUMP_FORCE = -15;
const PLATFORM_WIDTH = 50;
const PLATFORM_HEIGHT = 15;
// Réduire davantage la largeur pour être certain que Luigi ne touche pas le bord absolu
const GAME_WIDTH = window.innerWidth - 50;
export default function DoodleWeed({ onExit }) {
    const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER
    const [score, setScore] = useState(0);

    const stateRef = useRef({
        luigi: { x: GAME_WIDTH / 2, y: 300, vy: 0, vx: 0 },
        platforms: [],
        score: 0
    });
    const luigiRef = useRef(null);
    const [renderTick, setRenderTick] = useState(0);

    const endGame = () => {
        setGameState('GAMEOVER');
        if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
        if (stateRef.current.score > 0) {
            useStore.setState(state => ({ balance: state.balance + Math.floor(stateRef.current.score * 0.05) }));
            socket.emit('submit_score', { game: 'DOODLEWEED', score: stateRef.current.score });
        }
    };

    // --- INIT MAP ---
    const generateInitialPlatforms = () => {
        let initialPlatforms = [
            { id: 0, x: GAME_WIDTH / 2 - PLATFORM_WIDTH / 2, y: 400, type: 'normal' } // Starting platform
        ];
        // Generate up to y = -1000
        let currentY = 400;
        let idCount = 1;
        while (currentY > -1000) {
            currentY -= Math.random() * 60 + 40; // Distance between platforms
            initialPlatforms.push({
                id: idCount++,
                x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
                y: currentY,
                type: Math.random() > 0.9 ? 'spring' : 'normal'
            });
        }
        return initialPlatforms;
    };

    // --- GAME LOOP ---
    useEffect(() => {
        let animationFrameId;

        const updateGame = () => {
            if (gameState !== 'PLAYING') return;

            let state = stateRef.current;
            let currentLuigi = state.luigi;
            let currentPlatforms = state.platforms;

            let nextY = currentLuigi.y + currentLuigi.vy;
            let nextVy = currentLuigi.vy + GRAVITY;
            let nextX = currentLuigi.x + currentLuigi.vx;

            // Mouvement Horizontal
            nextX += currentLuigi.vx;

            // Screen Wrap (Left/Right)
            if (nextX < -30) nextX = GAME_WIDTH;
            if (nextX > GAME_WIDTH) nextX = -30;

            // --- COLLISION DETECTION (Anti-Tunneling Sweep) ---
            let platformsChanged = false;

            if (currentLuigi.vy > 0) {
                let hitPlatform = null;
                let keptPlatforms = [];

                // On vérifie le segment de chute [currentY, nextY]
                let startY = currentLuigi.y + 30; // 30 = pieds de luigi (bas de la hitbox)
                let endY = nextY + 30;

                for (let i = 0; i < currentPlatforms.length; i++) {
                    const plat = currentPlatforms[i];

                    // Le joueur était-il au-dessus de la plateforme à la frame précédente, et l'a dépassée à la frame actuelle ?
                    const isFallingThrough = startY <= plat.y + 10 && endY >= plat.y;
                    const isHorizontallyAligned = nextX + 30 > plat.x - 10 && nextX < plat.x + PLATFORM_WIDTH + 10;

                    if (!hitPlatform && isFallingThrough && isHorizontallyAligned) {
                        hitPlatform = plat;
                        if (plat.type !== 'breaking') {
                            keptPlatforms.push(plat);
                        }
                    } else {
                        keptPlatforms.push(plat);
                    }
                }

                if (currentPlatforms.length !== keptPlatforms.length) {
                    platformsChanged = true;
                }
                currentPlatforms = keptPlatforms;

                if (hitPlatform) {
                    // Snap to platform and jump
                    nextY = hitPlatform.y - 30;
                    nextVy = hitPlatform.type === 'spring' ? JUMP_FORCE * 1.5 : JUMP_FORCE;
                    if (window.navigator?.vibrate) window.navigator.vibrate(20);
                }
            }

            // --- CAMERA PANNING & SCORING ---
            if (nextY < 250) {
                platformsChanged = true;
                const diff = 250 - nextY;
                nextY = 250;

                let activePlatforms = [];
                for (let p of currentPlatforms) {
                    let py = p.y + diff;
                    if (py < 700) activePlatforms.push({ ...p, y: py });
                }

                state.score += Math.floor(diff / 5);
                setScore(state.score); // Sync UI

                // Progressive difficulty: dynamic caps for playability
                // Peak difficulty reached at 2500 score
                const difficultyMultiplier = Math.min(state.score / 2500, 1.0); 
                
                // Gap management: Luigi jumps ~204px. Max gap capped at 180px.
                const minDistance = 50 + (30 * difficultyMultiplier); // 50 to 80
                const maxDistanceAdd = 50 + (50 * difficultyMultiplier); // 50 to 100
                // Max possible gap = 180px

                const topPlatY = Math.min(...activePlatforms.map(p => p.y));
                if (topPlatY > 0) {
                    // Dynamic platform types: Normal platforms reach 0% at max difficulty
                    const springChance = 0.05; 
                    const breakChance = Math.min(0.95, 0.10 + (difficultyMultiplier * 0.90)); 

                    const rand = Math.random();
                    let platType = 'normal';
                    if (rand < springChance) platType = 'spring';
                    else if (rand < springChance + breakChance) platType = 'breaking';

                    activePlatforms.push({
                        id: Date.now(),
                        x: Math.random() * (GAME_WIDTH - PLATFORM_WIDTH),
                        y: topPlatY - (Math.random() * maxDistanceAdd + minDistance),
                        type: platType
                    });
                }
                currentPlatforms = activePlatforms;
            }

            // --- GAME OVER CONDITION ---
            if (nextY > 650) {
                endGame();
                return;
            }

            state.luigi = { x: nextX, y: nextY, vy: nextVy, vx: currentLuigi.vx };
            state.platforms = currentPlatforms;
            stateRef.current = state;

            if (luigiRef.current) {
                luigiRef.current.style.transform = `translate(${nextX}px, ${nextY}px) scaleX(${currentLuigi.vx < 0 ? -1 : 1})`;
            }

            if (platformsChanged) {
                setRenderTick(t => t + 1);
            }

            animationFrameId = requestAnimationFrame(updateGame);
        };

        if (gameState === 'PLAYING') {
            animationFrameId = requestAnimationFrame(updateGame);
        }
        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState]);

    // --- NATIVE TOUCH BLOCKER (iOS Safari) ---
    useEffect(() => {
        const preventDefault = (e) => {
            if (e.target.closest('.play-area')) {
                e.preventDefault();
            }
        };
        // Add non-passive event listeners to strictly block browser actions like zoom, scroll, or text selection
        document.addEventListener('touchstart', preventDefault, { passive: false });
        document.addEventListener('touchmove', preventDefault, { passive: false });
        // Optional: also block long press context menu
        document.addEventListener('contextmenu', preventDefault, { passive: false });

        return () => {
            document.removeEventListener('touchstart', preventDefault);
            document.removeEventListener('touchmove', preventDefault);
            document.removeEventListener('contextmenu', preventDefault);
        };
    }, []);

    // --- KEYBOARD CONTROLS ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameState !== 'PLAYING') return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                stateRef.current.luigi.vx = -3.5;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                stateRef.current.luigi.vx = 3.5;
            }
        };
        const handleKeyUp = (e) => {
            if (gameState !== 'PLAYING') return;
            if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(e.key)) {
                stateRef.current.luigi.vx = 0;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState]);

    // --- CONTROLS ---
    const handleTouchStart = (e) => {
        if (gameState !== 'PLAYING') return;
        const touchX = e.touches[0].clientX;
        stateRef.current.luigi.vx = touchX < window.innerWidth / 2 ? -3.5 : 3.5;
    };
    
    const handleTouchMove = (e) => { };
    
    const handleTouchEnd = () => {
        if (gameState === 'PLAYING') stateRef.current.luigi.vx = 0;
    };

    // --- ACTIONS ---
    const startGame = () => {
        stateRef.current = {
            luigi: { x: GAME_WIDTH / 2, y: 300, vy: JUMP_FORCE, vx: 0 },
            platforms: generateInitialPlatforms(),
            score: 0
        };
        setScore(0);
        setGameState('PLAYING');
        setRenderTick(t => t + 1);
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
                    <Coins size={16} color="#ffcc00" /> {Math.floor(score * 0.05)} (Sc: {score})
                </div>
            </div>

            <div className="game-container">
                {gameState === 'START' && (
                    <div className="overlay-menu">
                        <h1>Monte le + haut !</h1>
                        <p>Tape à gauche ou à droite de ton écran pour jouer.</p>
                        <p>(Ou utilise les flèches du clavier)</p>
                        <p>Ne tombe pas !</p>
                        <button className="start-btn" onClick={startGame}>JOUER</button>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="overlay-menu">
                        <h1>CHUTE</h1>
                        <p>Score: {score}</p>
                        <p>Gains: <strong style={{ color: '#ffcc00' }}>{Math.floor(score * 0.05)} <NeonIcon name="coin-gold" size={18} /></strong></p>
                        <button className="start-btn" onClick={startGame}>REJOUER</button>
                    </div>
                )}

                {/* --- RENDER GAME --- */}
                <div className="play-area">
                    {/* Platforms */}
                    {stateRef.current.platforms.map(plat => (
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
                            className="luigi"
                            ref={luigiRef}
                            style={{
                                transform: `translate(${stateRef.current.luigi.x}px, ${stateRef.current.luigi.y}px) scaleX(${stateRef.current.luigi.vx < 0 ? -1 : 1})`
                            }}
                        >
                            <img src="/images/yoshi-weed.png" alt="Yoshi" className="yoshi-sprite-doodle" />
                        </div>
                    )}
                </div>
            </div >

            <p style={{ textAlign: 'center', color: '#444', marginTop: '10px', fontSize: '0.85rem', fontWeight: '800' }}>
                Tape à gauche ou à droite de ton écran pour jouer
            </p>

            <style dangerouslySetInnerHTML={{
                __html: `
                .doodleweed-mobile {
                    --theme-color: #00cc66;
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    width: 100vw; height: 100vh; height: 100dvh;
                    display: flex; flex-direction: column;
                    align-items: center;
                    background: url('/grid-paper.png'), linear-gradient(to bottom, #e0ffe0 0%, #a0cca0 100%);
                    background-size: cover;
                    z-index: 9999;
                    padding: calc(env(safe-area-inset-top, 0px) + 85px) 15px 30px 15px;
                    box-sizing: border-box;
                    user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
                }

                .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: #114411; width: 100%; max-width: 450px; }
                .back-btn { background: rgba(0,0,0,0.1); border: none; padding: 10px; border-radius: 50%; color: #114411; display: flex; }
                .score-display { display: flex; align-items: center; justify-content: center; gap: 5px; font-weight: bold; font-variant-numeric: tabular-nums; min-width: 80px; background: rgba(255,255,255,0.8); padding: 5px 15px; border-radius: 20px; border: 2px solid #114411; }

                .game-container {
                    flex: 1; position: relative; width: 100%; max-width: 450px;
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
                    flex: 1; width: 100%; height: 100%; min-height: 100%; position: relative; overflow: hidden;
                }

                .luigi {
                    position: absolute; width: 40px; height: 40px;
                    transition: transform 0.1s; /* Smooth flip */
                }
                
                .yoshi-sprite-doodle {
                    width: 100%; height: 100%; object-fit: contain;
                    filter: drop-shadow(0 4px 4px rgba(0,0,0,0.3));
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
