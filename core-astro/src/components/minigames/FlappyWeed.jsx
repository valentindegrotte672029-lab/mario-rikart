import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Coins } from 'lucide-react';
import useStore from '../../store/useStore';

const GRAVITY = 0.3;
const JUMP_STRENGTH = -6;
const PIPE_SPEED = 2;
const PIPE_WIDTH = 60;
const PIPE_GAP = 270;
const BIRD_SIZE = 25;

export default function FlappyWeed({ onExit }) {

    const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER
    const [birdPos, setBirdPos] = useState(250);
    const [birdVelocity, setBirdVelocity] = useState(0);
    const [pipes, setPipes] = useState([]);
    const [score, setScore] = useState(0);


    const lastPipeSpawnPos = useRef(0);
    const gameAreaRef = useRef(null);

    const jump = () => {
        if (gameState === 'PLAYING') {
            setBirdVelocity(JUMP_STRENGTH);
            if (window.navigator?.vibrate) window.navigator.vibrate(20);
        } else if (gameState === 'START' || gameState === 'GAMEOVER') {
            startGame();
        }
    };

    const startGame = () => {
        setBirdPos(250);
        setBirdVelocity(0);
        setPipes([{ x: 400, topHeight: Math.random() * 200 + 50 }]);
        setScore(0);
        setGameState('PLAYING');
        lastPipeSpawnPos.current = 400;
    };

    const endGame = () => {
        setGameState('GAMEOVER');
        if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);

        // Reward calculation : 50000 coins per pipe passed
        if (score > 0) {
            const reward = score * 50000;
            useStore.setState(state => ({ balance: state.balance + reward }));
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
            setBirdPos((prev) => {
                const newPos = prev + birdVelocity;
                setBirdVelocity(v => v + GRAVITY);
                return newPos;
            });

            // 2. Update Pipes & Score & Collision
            setPipes((currentPipes) => {
                let newPipes = [...currentPipes];


                for (let i = 0; i < newPipes.length; i++) {
                    let p = newPipes[i];
                    p.x -= PIPE_SPEED;

                    // Score increment
                    if (p.x === 50) { // Passed the bird
                        setScore(s => {
                            const newScore = s + 1;
                            if (newScore % 5 === 0 && window.navigator?.vibrate) window.navigator.vibrate(50); // Milestone vibrate
                            return newScore;
                        });
                    }

                    // Collision detection
                    const birdLeft = 50;
                    const birdRight = 50 + BIRD_SIZE;
                    const pipeLeft = p.x;
                    const pipeRight = p.x + PIPE_WIDTH;

                    // Hit Horizontal?
                    if (birdRight > pipeLeft && birdLeft < pipeRight) {
                        // Hit Vertical ? (Upper pipe or Lower pipe)
                        const birdTop = birdPos;
                        const birdBottom = birdPos + BIRD_SIZE;

                        if (birdTop < p.topHeight || birdBottom > (p.topHeight + PIPE_GAP)) {
                            endGame();
                        }
                    }
                }

                // Remove off-screen pipes
                if (newPipes.length > 0 && newPipes[0].x < -PIPE_WIDTH) {
                    newPipes.shift();
                }

                // Spawn new pipes
                const lastPipe = newPipes[newPipes.length - 1];
                if (lastPipe && lastPipe.x < 150) {
                    newPipes.push({ x: 450, topHeight: Math.random() * 150 + 50 });
                }

                return newPipes;
            });

            // Floor / Ceiling Collision
            if (birdPos > 460 || birdPos < -40) {
                endGame();
            }

            animationFrameId = requestAnimationFrame(updateGame);
        };

        if (gameState === 'PLAYING') {
            animationFrameId = requestAnimationFrame(updateGame);
        }

        return () => cancelAnimationFrame(animationFrameId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, birdPos, birdVelocity]);

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
                    <Coins size={16} color="#ffcc00" /> {(score * 100)}
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
                        <div className="bird-preview" style={{ marginTop: '20px', fontSize: '3rem', animation: 'float 2s infinite alternate' }}>☁️🧔🏻‍♂️</div>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="overlay-menu">
                        <h1 style={{ color: '#ff3333' }}>CRASH !</h1>
                        <p>Score : {score} tuyaux</p>
                        <p>Gains : <strong style={{ color: '#ffcc00' }}>{score * 100} 🟡</strong></p>
                        <button className="start-btn" onClick={(e) => { e.stopPropagation(); startGame(); }}>REJOUER</button>
                    </div>
                )}

                {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
                    <>
                        <div
                            className="bird"
                            style={{
                                transform: `translateY(${birdPos}px) rotate(${Math.min(birdVelocity * 3, 90)}deg)`,
                                left: '50px'
                            }}
                        >
                            ☁️🧔🏻‍♂️
                        </div>

                        {pipes.map((pipe, idx) => (
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
                                        top: `${pipe.topHeight + PIPE_GAP}px`,
                                        height: `${500 - (pipe.topHeight + PIPE_GAP)}px`
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
            width: 100%; height: 100%; display: flex; flex-direction: column;
            background: rgba(10, 20, 10, 0.95); z-index: 50; position: absolute; top:0; left:0;
            padding: calc(var(--safe-top) + 20px) 15px 15px 15px;
        }

        .header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: var(--theme-color); }
        .back-btn { background: rgba(255,255,255,0.1); border: none; padding: 10px; border-radius: 50%; color: white; display: flex; }
        .score-display { display: flex; align-items: center; gap: 5px; font-weight: bold; background: rgba(0,0,0,0.5); padding: 5px 15px; border-radius: 20px; border: 1px solid var(--theme-color); }

        .game-area {
            flex: 1; position: relative; width: 100%; max-height: 500px;
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
            transition: transform 0.1s; filter: drop-shadow(0 0 5px white);
        }

        .pipe {
            position: absolute; width: 60px; background: linear-gradient(90deg, #11dd11 0%, #00ff00 50%, #11dd11 100%);
            border: 3px solid #005500; border-radius: 5px; z-index: 4;
            box-shadow: inset -5px 0 10px rgba(0,0,0,0.3);
        }
        .upper-pipe { top: 0; border-bottom: 8px solid #005500; }
        .lower-pipe { border-top: 8px solid #005500; }
      `}</style>
        </motion.div>
    );
}
