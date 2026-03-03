import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Coins, Eye } from 'lucide-react';
import useStore from '../../store/useStore';

const CARDS_DATA = [
    { id: 'c1', emoji: '🍄', pairId: 1 },
    { id: 'c2', emoji: '🍄', pairId: 1 },
    { id: 'c3', emoji: '🍃', pairId: 2 },
    { id: 'c4', emoji: '🍃', pairId: 2 },
    { id: 'c5', emoji: '🟡', pairId: 3 },
    { id: 'c6', emoji: '🟡', pairId: 3 },
    { id: 'c7', emoji: '☁️', pairId: 4 },
    { id: 'c8', emoji: '☁️', pairId: 4 },
    { id: 'c9', emoji: '🔥', pairId: 5 },
    { id: 'c10', emoji: '🔥', pairId: 5 },
    { id: 'c11', emoji: '👻', pairId: 6 },
    { id: 'c12', emoji: '👻', pairId: 6 },
];

// Fisher-Yates shuffle
const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

export default function MemoryPerch({ onExit }) {
    const [gameState, setGameState] = useState('START'); // START, PLAYING, GAMEOVER

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);

    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [hallucinationLevel, setHallucinationLevel] = useState(0); // 0 to 10

    // --- GAME LOGIC ---
    useEffect(() => {
        if (flippedIndices.length === 2) {
            const [firstIndex, secondIndex] = flippedIndices;
            const card1 = cards[firstIndex];
            const card2 = cards[secondIndex];

            if (card1.pairId === card2.pairId) {
                // Match !
                if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100]);
                setMatchedPairs(prev => [...prev, card1.pairId]);
                setScore(s => s + 100);
                setFlippedIndices([]);
                // Increase hallucination (visual distortion)
                setHallucinationLevel(prev => Math.min(10, prev + 2));
            } else {
                // No Match
                if (window.navigator?.vibrate) window.navigator.vibrate(50);
                setScore(s => Math.max(0, s - 10)); // Penalty
                setTimeout(() => {
                    setFlippedIndices([]);
                }, 1000);
            }
            setMoves(m => m + 1);
        }
    }, [flippedIndices, cards]);

    // Check Win
    useEffect(() => {
        if (matchedPairs.length === CARDS_DATA.length / 2 && gameState === 'PLAYING') {
            setTimeout(endGame, 1000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchedPairs, gameState]);

    // --- ACTIONS ---
    const startGame = () => {
        setCards(shuffleArray(CARDS_DATA).map(c => ({ ...c, uid: Math.random().toString() })));
        setFlippedIndices([]);
        setMatchedPairs([]);
        setMoves(0);
        setScore(0);
        setHallucinationLevel(0);
        setGameState('PLAYING');
    }

    const endGame = () => {
        setGameState('GAMEOVER');
        if (score > 0) {
            useStore.setState(state => ({ balance: state.balance + score }));
        }
    };

    const handleCardClick = (index) => {
        if (gameState !== 'PLAYING') return;
        if (flippedIndices.length >= 2) return; // Prevent clicking more than 2
        if (flippedIndices.includes(index)) return; // Already flipped
        if (matchedPairs.includes(cards[index].pairId)) return; // Already matched

        setFlippedIndices(prev => [...prev, index]);
    };

    // Dynamic styles based on hallucination level
    const blurAmount = hallucinationLevel * 0.3; // max 3px
    const hueRotate = hallucinationLevel * 15; // max 150deg
    const contrast = 100 + (hallucinationLevel * 10);

    return (
        <motion.div
            className="page-mobile memoryperch-mobile"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            style={{
                filter: `hue-rotate(${hueRotate}deg) contrast(${contrast}%)`
            }}
        >
            <div className="game-wrapper" style={{ filter: `blur(${blurAmount}px)` }}>
                <div className="header-nav">
                    <button className="back-btn" onClick={onExit}><ArrowLeft size={24} /></button>
                    <h2>MEMORY PERCHÉ</h2>
                    <div className="score-display">
                        <Coins size={16} color="#ffcc00" /> {score}
                    </div>
                </div>

                <div className="info-bar">
                    <span>Coups : {moves}</span>
                    <span>Trouvés : {matchedPairs.length}/6</span>
                </div>

                <div className="game-container">
                    {gameState === 'START' && (
                        <div className="overlay-menu">
                            <h1>Trip Memory</h1>
                            <p>Trouve les paires.</p>
                            <p>Attention, plus tu gagnes, plus ta vision se trouble...</p>
                            <button className="start-btn" onClick={startGame}>JOUER</button>
                        </div>
                    )}

                    {gameState === 'GAMEOVER' && (
                        <div className="overlay-menu">
                            <h1>REDESCENTE</h1>
                            <p>Coups joués: {moves}</p>
                            <p>Score final: <strong style={{ color: '#ffcc00' }}>{score} 🟡</strong></p>
                            <button className="start-btn" onClick={startGame}>REJOUER</button>
                        </div>
                    )}

                    {/* --- GRID RENDER --- */}
                    <div className="cards-grid">
                        {cards.map((card, index) => {
                            const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.pairId);
                            const isMatched = matchedPairs.includes(card.pairId);

                            return (
                                <motion.div
                                    key={card.uid}
                                    className={`card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                                    onClick={() => handleCardClick(index)}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <div className="card-inner">
                                        <div className="card-front">
                                            {/* Visuel du dos de la carte */}
                                            <div className="card-pattern">🍄</div>
                                        </div>
                                        <div className="card-back">
                                            {card.emoji}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                .memoryperch - mobile {
                    --theme - color: #9933ff;
            width: 100 %; height: 100 %; display: flex; flex - direction: column;
    background: radial - gradient(circle at center, #2a0040 0 %, #0a0010 100 %);
    z - index: 50; position: absolute; top: 0; left: 0;
    padding: calc(var(--safe - top) + 20px) 15px 15px 15px;
    transition: filter 1s ease -in -out; /* Smooth hallucination changes */
}

                .game - wrapper {
    display: flex; flex - direction: column; height: 100 %;
    transition: filter 1s ease -in -out;
}

                .header - nav { display: flex; justify - content: space - between; align - items: center; margin - bottom: 10px; color: #cc88ff; }
                .back - btn { background: rgba(255, 255, 255, 0.1); border: none; padding: 10px; border - radius: 50 %; color: #cc88ff; display: flex; }
                .score - display { display: flex; align - items: center; gap: 5px; font - weight: bold; background: rgba(0, 0, 0, 0.5); padding: 5px 15px; border - radius: 20px; border: 1px solid var(--theme - color); color: white; }

                .info - bar {
    display: flex; justify - content: space - between; margin - bottom: 20px;
    color: rgba(255, 255, 255, 0.7); font - size: 0.9rem; font - weight: bold;
    padding: 0 10px;
}

                .game - container {
    flex: 1; position: relative;
    background: transparent;
}

                .overlay - menu { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(10, 0, 16, 0.9); z - index: 20; display: flex; flex - direction: column; align - items: center; justify - content: center; text - align: center; padding: 20px; border - radius: 16px; border: 2px solid var(--theme - color); box - shadow: 0 0 30px rgba(153, 51, 255, 0.4); }
                .overlay - menu h1 { color: #eebbff; font - size: 2.5rem; margin - bottom: 10px; text - shadow: 0 0 10px var(--theme - color); font - family: 'Knewave', cursive; }
                .overlay - menu p { color: white; margin - bottom: 5px; font - size: 1.1rem; }
                .overlay - menu p: last - of - type { margin - bottom: 30px; }
                .start - btn { background: var(--theme - color); color: white; font - weight: bold; font - size: 1.2rem; padding: 15px 40px; border - radius: 30px; border: none; box - shadow: 0 0 15px var(--theme - color); }

                /* --- CSS 3D CARDS --- */
                .cards - grid {
    display: grid;
    grid - template - columns: repeat(3, 1fr);
    gap: 10px;
    padding: 10px;
    height: 100 %;
    max - height: 500px;
    align - content: start;
}

                .card {
    background: transparent;
    width: 100 %; aspect - ratio: 3 / 4; /* Poker card aspect */
    perspective: 1000px;
    cursor: pointer;
}

                .card - inner {
    position: relative; width: 100 %; height: 100 %; text - align: center;
    transition: transform 0.6s; transform - style: preserve - 3d;
    box - shadow: 0 4px 8px rgba(0, 0, 0, 0.5); border - radius: 10px;
}

                .card.flipped.card - inner { transform: rotateY(180deg); }
                
                .card.matched.card - inner { animation: pulsate 2s infinite alternate; }

                .card - front, .card - back {
    position: absolute; width: 100 %; height: 100 %;
    -webkit - backface - visibility: hidden; backface - visibility: hidden;
    border - radius: 10px; display: flex; justify - content: center; align - items: center;
}

                .card - front {
    background: linear - gradient(135deg, #4d1a80, #26004d);
    border: 2px solid #8844cc;
    color: white; font - size: 2rem;
}

                .card - pattern { opacity: 0.2; }

                .card - back {
    background: #ffffff;
    color: black;
    transform: rotateY(180deg);
    font - size: 3rem;
    border: 2px solid #fff;
    box - shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

@keyframes pulsate {
    0 % { box- shadow: 0 0 10px rgba(153, 51, 255, 0.2);
}
100 % { box- shadow: 0 0 20px rgba(153, 51, 255, 0.8), 0 0 40px rgba(153, 51, 255, 0.4); }
                }

`}</style>
        </motion.div>
    );
}
