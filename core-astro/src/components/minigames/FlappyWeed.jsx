import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import useStore from '../../store/useStore';
import { socket } from '../../socket';
import NeonIcon from '../NeonIcon';

const GRAVITY = 0.40; // Simpler
const JUMP_STRENGTH = -8.0; // More controlled
const PIPE_SPEED = 3.0;
const PIPE_WIDTH = 60;
const PIPE_GAP = 250; // Larger gap
const BIRD_SIZE = 25;

export default function FlappyWeed({ onExit }) {
    const [gameState, setGameState] = useState('START');
    const [score, setScore] = useState(0);

    // Physics Refs for 60fps
    const birdRef = useRef({ y: 250, v: 0 });
    const pipesRef = useRef([]);
    const scoreRef = useRef(0);
    const [renderTick, setRenderTick] = useState(0);
    const lastPipeSpawnPos = useRef(0);
    const gameAreaRef = useRef(null);

    const jump = () => {
        if (gameState === 'PLAYING') {
            birdRef.current.v = JUMP_STRENGTH;
            if (window.navigator?.vibrate) window.navigator.vibrate(20);
        } else if (gameState === 'START' || gameState === 'GAMEOVER') {
            startGame();
        }
    };

    const startGame = () => {
        birdRef.current = { y: 250, v: 0 };
        pipesRef.current = [{ x: 400, topHeight: Math.random() * 150 + 50, passed: false }];
        scoreRef.current = 0;
        setScore(0);
        setGameState('PLAYING');
        lastPipeSpawnPos.current = 400;
        setRenderTick(t => t + 1);
    };

    const endGame = () => {
        setGameState('GAMEOVER');
        if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);

        // Reward calculation : 50 coins per pipe passed
        // Use scoreRef.current to avoid React closure stale state
        if (scoreRef.current > 0) {
            const reward = scoreRef.current * 5;
            useStore.setState(state => ({ balance: state.balance + reward }));

            // Send score to leaderboard
            socket.emit('submit_score', { game: 'FLAPPYWEED', score: scoreRef.current });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.key === 'ArrowUp') {
                jump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState]);

    useEffect(() => {
        let animationFrameId;

        const updateGame = () => {
            if (gameState !== 'PLAYING') return;

            // 1. Update Bird
            birdRef.current.y += birdRef.current.v;
            birdRef.current.v += GRAVITY;

            // 2. Update Pipes
            let newPipes = [...pipesRef.current];

            // Progressive difficulty calculations (Slightly slower increment)
            let currentSpeed = PIPE_SPEED + (scoreRef.current * 0.15);
            currentSpeed = Math.min(currentSpeed, 6); // Cap speed

            let currentGap = PIPE_GAP - (scoreRef.current * 1.5);
            currentGap = Math.max(currentGap, 120); // Min gap size

            for (let i = 0; i < newPipes.length; i++) {
                let p = newPipes[i];
                p.x -= currentSpeed;

                // Score increment
                if (p.x < 50 && !p.passed) {
                    p.passed = true;
                    scoreRef.current += 1;
                    setScore(scoreRef.current);
                    if (scoreRef.current % 5 === 0 && window.navigator?.vibrate) window.navigator.vibrate(50);
                }

                // Collision detection
                const birdLeft = 50;
                const birdRight = 50 + BIRD_SIZE;
                const pipeLeft = p.x;
                const pipeRight = p.x + PIPE_WIDTH;

                if (birdRight > pipeLeft && birdLeft < pipeRight) {
                    const birdTop = birdRef.current.y;
                    const birdBottom = birdRef.current.y + BIRD_SIZE;

                    if (birdTop < p.topHeight || birdBottom > (p.topHeight + currentGap)) {
                        endGame();
                        return; // Stop update loop
                    }
                }
            }

            // Remove off-screen pipes
            if (newPipes.length > 0 && newPipes[0].x < -PIPE_WIDTH) {
                newPipes.shift();
            }

            // Spawn new pipes based on dynamic speed (maintain distance visually)
            const lastPipe = newPipes[newPipes.length - 1];
            const spawnDistance = 150 + (currentSpeed * 10); // Spawn earlier if moving faster
            if (lastPipe && lastPipe.x < spawnDistance) {
                newPipes.push({ x: 450, topHeight: Math.random() * 150 + 50, passed: false });
            }

            pipesRef.current = newPipes;

            // Floor / Ceiling Collision
            if (birdRef.current.y > 460 || birdRef.current.y < -40) {
                endGame();
                return;
            }

            setRenderTick(t => t + 1); // Trigger React visual render
            animationFrameId = requestAnimationFrame(updateGame);
        };

        if (gameState === 'PLAYING') {
            animationFrameId = requestAnimationFrame(updateGame);
        }

        return () => cancelAnimationFrame(animationFrameId);
    }, [gameState]);

    return (
        <motion.div
            className="page-mobile flappy-mobile"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.3 }}
        >
            <div className="header-nav">
                <button className="back-btn" onClick={onExit}><ArrowLeft size={24} /></button>
                <h2>ROULE-TA-FLEUR</h2>
                <div className="score-display">
                    <Coins size={16} color="#ffcc00" /> {score * 5}
                </div>
            </div>

            <div
                className="game-area"
                onClick={jump}
                ref={gameAreaRef}
            >
                <div className="moving-background"></div>

                {gameState === 'START' && (
                    <div className="overlay-menu">
                        <h1>Appuie pour Voler</h1>
                        <p>100 Pièces par Tuyau passé !</p>
                        <div className="bird-preview" style={{ marginTop: '20px', animation: 'float 2s infinite alternate' }}>
                            <img src="/images/yoshi-weed.png" alt="Yoshi" className="yoshi-sprite" />
                        </div>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="overlay-menu">
                        <h1 style={{ color: '#ff3333' }}>CRASH !</h1>
                        <p>Score : {score} tuyaux</p>
                        <p>Gains : <strong style={{ color: '#ffcc00' }}>{score * 5} <NeonIcon name="coin-gold" size={18} /></strong></p>
                        <button className="start-btn" onClick={(e) => { e.stopPropagation(); startGame(); }}>REJOUER</button>
                    </div>
                )}

                {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
                    <>
                        <div
                            className="bird"
                            style={{
                                transform: `translateY(${birdRef.current.y}px) rotate(${Math.min(birdRef.current.v * 3, 90)}deg)`,
                                left: '50px'
                            }}
                        >
                            <img src="/images/yoshi-weed.png" alt="Yoshit" className="yoshi-sprite" />
                        </div>

                        {pipesRef.current.map((pipe, idx) => (
                            <React.Fragment key={idx}>
                                {/* Upper Pipe */}
                                <div
                                    className="pipe upper-pipe"
                                    style={{
                                        left: `${pipe.x}px`,
                                        height: `${pipe.topHeight}px`
                                    }}
                                ></div>
                                {/* Lower Pipe */}
                                <div
                                    className="pipe lower-pipe"
                                    style={{
                                        left: `${pipe.x}px`,
                                        top: `${pipe.topHeight + Math.max(PIPE_GAP - (scoreRef.current * 1.5), 120)}px`,
                                        height: `${500}px` // Just fill the bottom
                                    }}
                                ></div>
                            </React.Fragment>
                        ))}
                    </>
                )}
            </div>

            <p style={{ textAlign: 'center', color: '#888', marginTop: '10px' }}>Tapote l'écran pour rester en l'air.</p>

            <style>{`
        .flappy-mobile {
            --theme-color: #39ff14;
            --sky-color: #87CEEB;
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            width: 100vw; height: 100vh; height: 100dvh;
            display: flex; flex-direction: column;
            align-items: center;
            background-color: #050a05;
            z-index: 9999;
            padding: calc(env(safe-area-inset-top, 0px) + 85px) 15px 15px 15px;
            box-sizing: border-box;
        }

        .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: var(--theme-color); width: 100%; max-width: 450px; }
        .back-btn { background: rgba(255,255,255,0.1); border: none; padding: 10px; border-radius: 50%; color: white; display: flex; }
        .score-display { display: flex; align-items: center; gap: 5px; font-weight: bold; background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 20px; border: 1px solid var(--theme-color); }

        .game-area {
            flex: 1; position: relative; width: 100%; max-width: 450px; max-height: 500px;
            background: linear-gradient(to bottom, #1a4a1a, #0a1a0a);
            border-radius: 20px; overflow: hidden; border: 2px solid var(--theme-color);
            box-shadow: 0 0 20px rgba(57, 255, 20, 0.3); touch-action: none; cursor: pointer;
        }

        .moving-background {
            position: absolute; top:0; left:0; right:0; bottom:0; opacity: 0.1;
            background-image: radial-gradient(var(--theme-color) 1px, transparent 1px);
            background-size: 20px 20px; animation: bgScroll 10s linear infinite;
        }

        @keyframes bgScroll { from { background-position: 0 0; } to { background-position: -200px 0; } }
        @keyframes float { from { transform: translateY(0px); } to { transform: translateY(-20px); } }

        .overlay-menu {
            position: absolute; top:0; left:0; right:0; bottom:0;
            background: rgba(0,0,0,0.7); z-index: 10; display: flex; flex-direction: column;
            align-items: center; justify-content: center; text-align: center; padding: 20px;
        }
        .overlay-menu h1 { color: white; font-size: 2.2rem; margin-bottom: 10px; text-shadow: 0 0 15px var(--theme-color); }
        .start-btn { margin-top: 20px; background: var(--theme-color); color: black; font-weight: bold; font-size: 1.5rem; padding: 15px 40px; border-radius: 30px; border: none; box-shadow: 0 0 15px var(--theme-color); }

        .bird {
            position: absolute; width: 40px; height: 40px; z-index: 5;
            font-size: 2.5rem; display: flex; justify-content: center; align-items: center;
            filter: drop-shadow(0 0 5px white);
        }

        .pipe { position: absolute; width: 60px; background: linear-gradient(90deg, #11dd11, #00aa00, #11dd11); border: 3px solid #005500; border-radius: 5px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); }
        .upper-pipe { top: 0; border-bottom: 6px solid #005500; }
        .lower-pipe { border-top: 6px solid #005500; }
        
        .yoshi-sprite { width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 0 8px rgba(57, 255, 20, 0.6)); }
      `}</style>
        </motion.div>
    );
}
