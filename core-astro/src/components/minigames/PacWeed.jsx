import React, { useState, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Ghost } from 'lucide-react';
import useStore from '../../store/useStore';

const GRID_SIZE = 15;
const CELL_SIZE = 20; // 20px per cell
const GAME_DURATION = 30; // 30 seconds

// Simple map definition: 1 = wall, 0 = dot, 2 = power pellet (coin)
const INITIAL_MAP = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
    [1, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export default function PacWeed({ onExit }) {
        const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER
    const [map, setMap] = useState([...INITIAL_MAP.map(row => [...row])]);
    const [luigiPos, setLuigiPos] = useState({ x: 7, y: 11 });
    const [ghosts, setGhosts] = useState([
        { id: 1, x: 7, y: 7, dir: 'up' },
        { id: 2, x: 6, y: 7, dir: 'right' }
    ]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);

    // Keyboard controls
    const handleKeyDown = useCallback((e) => {
        if (gameState !== 'PLAYING') return;

        let { x, y } = luigiPos;
        if (e.key === 'ArrowUp') y -= 1;
        if (e.key === 'ArrowDown') y += 1;
        if (e.key === 'ArrowLeft') x -= 1;
        if (e.key === 'ArrowRight') x += 1;

        // Wraparound logic for row 7
        if (y === 7) {
            if (x < 0) x = GRID_SIZE - 1;
            if (x >= GRID_SIZE) x = 0;
        }

        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && map[y][x] !== 1) {
            setLuigiPos({ x, y });

            // Eat dot
            if (map[y][x] === 0 || map[y][x] === 2) {
                const value = map[y][x] === 2 ? 500 : 10;
                setScore(prev => prev + value);

                const newMap = [...map];
                newMap[y][x] = -1; // Empty
                setMap(newMap);

                if (window.navigator?.vibrate) window.navigator.vibrate(10);
            }
        }
    }, [luigiPos, map, gameState]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Game loop (Timer & Ghosts)
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    endGame();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const ghostInterval = setInterval(() => {
            setGhosts(prevGhosts => prevGhosts.map(ghost => {
                const dirs = [
                    { dx: 0, dy: -1, name: 'up' },
                    { dx: 0, dy: 1, name: 'down' },
                    { dx: -1, dy: 0, name: 'left' },
                    { dx: 1, dy: 0, name: 'right' }
                ];

                // Very dumb ghost logic : try current dir, else pick random valid dir
                let { x, y, dir } = ghost;
                let currentDirObj = dirs.find(d => d.name === dir) || dirs[0];

                let nx = x + currentDirObj.dx;
                let ny = y + currentDirObj.dy;

                // Wraparound for ghost
                if (ny === 7) {
                    if (nx < 0) nx = GRID_SIZE - 1;
                    if (nx >= GRID_SIZE) nx = 0;
                }

                if (ny >= 0 && ny < GRID_SIZE && nx >= 0 && nx < GRID_SIZE && map[ny][nx] !== 1) {
                    // Can continue straight
                } else {
                    // Need to turn
                    const validDirs = dirs.filter(d => {
                        let checkX = x + d.dx;
                        let checkY = y + d.dy;
                        if (checkY === 7) {
                            if (checkX < 0) checkX = GRID_SIZE - 1;
                            if (checkX >= GRID_SIZE) checkX = 0;
                        }
                        return checkY >= 0 && checkY < GRID_SIZE && checkX >= 0 && checkX < GRID_SIZE && map[checkY][checkX] !== 1;
                    });
                    if (validDirs.length > 0) {
                        const randomDir = validDirs[Math.floor(Math.random() * validDirs.length)];
                        nx = x + randomDir.dx;
                        ny = y + randomDir.dy;
                        dir = randomDir.name;
                    } else {
                        nx = x; ny = y; // Stuck
                    }
                }

                // Collision check
                if (nx === luigiPos.x && ny === luigiPos.y) {
                    handleDeath();
                }

                return { ...ghost, x: nx, y: ny, dir };
            }));
        }, 400); // Ghost speed

        return () => {
            clearInterval(timer);
            clearInterval(ghostInterval);
        };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [gameState, map, luigiPos]);

    // Touch controls for mobile
    const handleTouch = (dir) => {
        handleKeyDown({ key: `Arrow${dir}` });
  };

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setLuigiPos({ x: 7, y: 11 });
    setMap([...INITIAL_MAP.map(row => [...row])]);
  };

  const handleDeath = () => {
      if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
      setScore(Math.max(0, score - 500)); // Penality
      setLuigiPos({ x: 7, y: 11 }); // Reset pos
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    if (score > 0) {
        useStore.setState(state => ({ balance: state.balance + score }));
    }
  };

  return (
    <motion.div
      className="page-mobile pacweed-mobile"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '-100%' }}
      transition={{ duration: 0.3 }}
    >
      <div className="header-nav">
        <button className="back-btn" onClick={onExit}><ArrowLeft size={24} /></button>
        <h2>PAC-WEED</h2>
        <div className="score-display">
            <Coins size={16} color="#ffcc00"/> {score}
        </div>
      </div>

      <div className="game-container">
        {gameState === 'START' && (
            <div className="overlay-menu">
                <h1>Prêt à rouler ?</h1>
                <p>Gobe les feuilles '🍃' et esquive les BOO défoncés.</p>
                <button className="start-btn" onClick={startGame}>JOUER (30s)</button>
            </div>
        )}

        {gameState === 'GAMEOVER' && (
            <div className="overlay-menu">
                <h1>TIME'S UP!</h1>
                <p>Tu as gagné : <strong style={{color:'#ffcc00'}}>{score} 🟡</strong></p>
                <button className="start-btn" onClick={startGame}>REJOUER</button>
            </div>
        )}

        {/* Game Grid */}
        <div className="grid-area">
            {map.map((row, y) => (
                <div key={y} className="grid-row">
                    {row.map((cell, x) => (
                        <div key={x} className={`grid - cell ${ cell === 1 ? 'wall' : ''}`}>
                            {cell === 0 && <span className="dot">🍃</span>}
                            {cell === 2 && <span className="power">🟡</span>}
                            
                            {luigiPos.x === x && luigiPos.y === y && (
                                <motion.div className="luigi-head" layoutId="luigi">🧔🏻‍♂️</motion.div>
                            )}

                            {ghosts.find(g => g.x === x && g.y === y) && (
                                <motion.div className="ghost-head">👻</motion.div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
      </div>

      {/* D-PAD for Mobile */}
      <div className="dpad-container">
          <div className="dpad-row">
              <button className="dpad-btn up" onClick={() => handleTouch('Up')}>▲</button>
          </div>
          <div className="dpad-row">
              <button className="dpad-btn left" onClick={() => handleTouch('Left')}>◀</button>
              <div className="timer-display">{timeLeft}s</div>
              <button className="dpad-btn right" onClick={() => handleTouch('Right')}>▶</button>
          </div>
          <div className="dpad-row">
              <button className="dpad-btn down" onClick={() => handleTouch('Down')}>▼</button>
          </div>
      </div>

      <style>{`
        .pacweed - mobile {
        --theme - color: #39ff14;
        width: 100 %; height: 100 %; display: flex; flex - direction: column;
        background: rgba(10, 20, 10, 0.95); z - index: 50; position: absolute; top: 0; left: 0;
        padding: calc(var(--safe - top) + 20px) 15px 15px 15px;
    }

        .header - nav { display: flex; justify - content: space - between; align - items: center; margin - bottom: 20px; color: var(--theme - color); }
        .back - btn { background: rgba(255, 255, 255, 0.1); border: none; padding: 10px; border - radius: 50 %; color: white; display: flex; }
        .score - display { display: flex; align - items: center; gap: 5px; font - weight: bold; background: rgba(0, 0, 0, 0.5); padding: 5px 15px; border - radius: 20px; border: 1px solid var(--theme - color); }

        .game - container {
        flex: 1; display: flex; justify - content: center; align - items: center; position: relative;
        background: black; border - radius: 20px; overflow: hidden; border: 2px solid var(--theme - color);
        box - shadow: 0 0 20px rgba(57, 255, 20, 0.3);
        margin - bottom: 20px; max - height: 400px;
    }

        .overlay - menu { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.8); z - index: 10; display: flex; flex - direction: column; align - items: center; justify - content: center; text - align: center; padding: 20px; }
        .overlay - menu h1 { color: var(--theme - color); font - size: 2.5rem; margin - bottom: 10px; text - shadow: 0 0 10px var(--theme - color); }
        .overlay - menu p { color: white; margin - bottom: 30px; font - size: 1.1rem; }
        .start - btn { background: var(--theme - color); color: black; font - weight: bold; font - size: 1.5rem; padding: 15px 40px; border - radius: 30px; border: none; box - shadow: 0 0 15px var(--theme - color); }

        .grid - area {
        display: flex; flex - direction: column; width: 100 %; height: 100 %;
    }
        .grid - row { display: flex; flex: 1; justify - content: space - around; }
        .grid - cell { flex: 1; display: flex; justify - content: center; align - items: center; position: relative; }
        
        .grid - cell.wall { background: rgba(57, 255, 20, 0.2); border: 1px solid rgba(57, 255, 20, 0.4); border - radius: 4px; }
        
        .dot { font - size: 0.6rem; opacity: 0.6; }
        .power { font - size: 0.8rem; animation: pulse 0.5s infinite alternate; }
        .luigi - head { font - size: 1.2rem; position: absolute; z - index: 5; text - shadow: 0 0 5px white; }
        .ghost - head { font - size: 1.2rem; position: absolute; z - index: 4; filter: opacity(0.8) drop - shadow(0 0 5px purple); }

        .dpad - container { display: flex; flex - direction: column; align - items: center; gap: 10px; padding - bottom: calc(var(--safe - bottom) + 80px); }
        .dpad - row { display: flex; justify - content: center; gap: 15px; width: 100 %; align - items: center; }
        .dpad - btn { width: 60px; height: 60px; border - radius: 15px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: white; font - size: 1.5rem; display: flex; justify - content: center; align - items: center; }
        .dpad - btn:active { background: var(--theme - color); color: black; transform: scale(0.9); }
        .timer - display { font - size: 2rem; font - weight: bold; color: white; text - shadow: 0 0 10px red; width: 80px; text - align: center; }

    @keyframes pulse { from { transform: scale(0.8); } to { transform: scale(1.2); } }
    `}</style>
    </motion.div>
  );
}
