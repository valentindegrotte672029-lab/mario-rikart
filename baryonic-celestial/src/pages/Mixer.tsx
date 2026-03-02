import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';

type IngredientType = 'alcohol' | 'mushroom' | 'popper' | 'water';

interface FallingItem {
    id: string;
    type: IngredientType;
    x: number;
}

const INGREDIENT_TYPES: IngredientType[] = ['alcohol', 'mushroom', 'popper', 'water'];
const CORRECT_INGREDIENTS = ['alcohol', 'mushroom', 'popper'];

const Mixer: React.FC = () => {
    const { addCoins } = useAppStore();
    const [items, setItems] = useState<FallingItem[]>([]);
    const [gameState, setGameState] = useState<'playing' | 'overdose' | 'success'>('playing');
    const [score, setScore] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const jerrycanRef = useRef<HTMLDivElement>(null);

    // Spawner
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            setItems((prev) => {
                if (prev.length > 5) return prev; // max concurrent items
                const type = INGREDIENT_TYPES[Math.floor(Math.random() * INGREDIENT_TYPES.length)];
                const x = Math.random() * 80 + 10; // 10% to 90%
                return [...prev, { id: Math.random().toString(), type, x }];
            });
        }, 1500);

        return () => clearInterval(interval);
    }, [gameState]);

    const handleDragEnd = (_event: any, info: any, item: FallingItem) => {
        if (gameState !== 'playing') return;

        // Check collision with jerrycan
        if (jerrycanRef.current) {
            const jerrycanRect = jerrycanRef.current.getBoundingClientRect();
            const dropPoint = {
                x: info.point.x,
                y: info.point.y
            };

            const isInside =
                dropPoint.x >= jerrycanRect.left &&
                dropPoint.x <= jerrycanRect.right &&
                dropPoint.y >= jerrycanRect.top &&
                dropPoint.y <= jerrycanRect.bottom;

            if (isInside) {
                if (CORRECT_INGREDIENTS.includes(item.type)) {
                    // Success ingredient
                    setScore(s => s + 1);
                    setItems(prev => prev.filter(i => i.id !== item.id));

                    if (score + 1 >= 3) {
                        setGameState('success');
                        addCoins(5000);
                    }
                } else {
                    // Fail ingredient (water) -> overdoses because incorrect mix
                    setGameState('overdose');
                }
            }
        }
    };

    const getEmoji = (type: IngredientType) => {
        switch (type) {
            case 'alcohol': return '🍾';
            case 'mushroom': return '🍄';
            case 'popper': return '🧪';
            case 'water': return '💧'; // wrong ingredient
        }
    };

    const resetGame = () => {
        setGameState('playing');
        setScore(0);
        setItems([]);
    };

    return (
        <div className="w-full h-full min-h-[70vh] flex flex-col items-center bg-[#0a0a0c] relative overflow-hidden" ref={containerRef}>
            <h1 className="text-3xl glitch-text font-black text-[var(--neon-green)] mt-4" data-text="FUEL MIXER">
                FUEL MIXER
            </h1>
            <p className="text-gray-400 font-mono text-xs mt-2 uppercase text-center max-w-[250px]">
                Drag Alcohol, Mushrooms, and Poppers into the Jerrycan! Avoid water.
            </p>

            <div className="font-mono text-white mt-4 font-bold border2 px-4 py-1 rounded-full border border-gray-700">
                Score: {score} / 3
            </div>

            {/* Game Area */}
            <div className="flex-1 w-full relative mt-8">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        drag
                        dragConstraints={containerRef}
                        onDragEnd={(e, info) => handleDragEnd(e, info, item)}
                        whileDrag={{ scale: 1.5, zIndex: 50 }}
                        initial={{ y: -50, x: `${item.x}vw`, opacity: 0 }}
                        animate={{ y: '50vh', opacity: 1 }}
                        transition={{ y: { duration: 5, ease: 'linear' } }}
                        onAnimationComplete={() => {
                            // Remove item if it hits bottom without being dragged
                            setItems(prev => prev.filter(i => i.id !== item.id));
                        }}
                        className="absolute text-4xl cursor-grab active:cursor-grabbing hover:scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-white/10 rounded-full w-14 h-14 flex items-center justify-center backdrop-blur-sm border border-white/20"
                        style={{ left: `${item.x}%` }}
                    >
                        {getEmoji(item.type)}
                    </motion.div>
                ))}

                {/* Jerrycan Dropzone */}
                <div
                    ref={jerrycanRef}
                    className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-40 h-48 border-4 rounded-xl flex flex-col items-center justify-end pb-4 transition-colors ${gameState === 'overdose' ? 'border-red-600 bg-red-600/20' :
                        gameState === 'success' ? 'border-[var(--neon-green)] bg-[var(--neon-green)]/20' :
                            'border-gray-500 bg-gray-800 focus-within:border-white'
                        }`}
                    style={{ boxShadow: '0 0 30px rgba(0,0,0,0.5) inset' }}
                >
                    <div className="absolute -top-8 w-12 h-8 border-4 border-b-0 border-current rounded-t-lg" />
                    <div className="absolute -top-4 -left-4 w-6 h-12 border-4 border-r-0 border-current rounded-l-full" />
                    <span className="font-black text-3xl opacity-30 tracking-tighter mix-blend-overlay">FUEL</span>
                </div>
            </div>

            {/* Popups */}
            {gameState === 'overdose' && (
                <div className="absolute inset-0 bg-red-900/90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
                    <motion.h2
                        initial={{ scale: 0 }} animate={{ scale: 1.2 }}
                        className="text-5xl font-black text-white glitch-text" data-text="OVERDOSE"
                    >
                        OVERDOSE
                    </motion.h2>
                    <p className="text-white mt-4 font-mono">You mixed the wrong shit.</p>
                    <button
                        onClick={resetGame}
                        className="mt-8 px-8 py-3 bg-black text-red-500 font-bold font-mono tracking-widest border border-red-500 hover:bg-red-500 hover:text-black transition-colors"
                    >
                        RESPAWN
                    </button>
                </div>
            )}

            {gameState === 'success' && (
                <div className="absolute inset-0 bg-green-900/90 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-sm">
                    <motion.h2
                        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                        className="text-4xl font-black text-[#39ff14] text-center"
                    >
                        PERFECT MIX
                    </motion.h2>
                    <p className="text-white mt-4 font-mono text-xl">+5,000 COINS</p>
                    <button
                        onClick={resetGame}
                        className="mt-8 px-8 py-3 bg-[#39ff14] text-black font-bold font-mono tracking-widest hover:bg-white transition-colors"
                    >
                        MIX AGAIN
                    </button>
                </div>
            )}
        </div>
    );
};

export default Mixer;
