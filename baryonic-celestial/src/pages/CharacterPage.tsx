import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Beaker, Lock, Unlock, ArrowLeft } from 'lucide-react';

const MarioProfile = () => (
    <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center p-6 relative">
        {/* Depression Vignette */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#3a0000_150%)] z-10 opacity-80 mix-blend-multiply" />
        <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl glitch-text text-[var(--mario-red)] font-black italic mb-4"
            data-text="MARIO"
        >
            MARIO
        </motion.h1>
        <p className="text-gray-400 text-center font-mono text-sm max-w-xs relative z-20">
            "Everything feels heavy. Even the mushrooms don't work anymore."
        </p>
        <div className="w-32 h-32 rounded-full border-4 border-[#e00000] mt-8 bg-[#3a0000] flex items-center justify-center grayscale contrast-125 relative z-20">
            <span className="text-6xl font-black text-[#e00000] opacity-50">M</span>
        </div>
    </div>
);

const LuigiProfile = () => (
    <div className="w-full h-full min-h-[70vh] flex flex-col items-center p-6 relative bg-[#001a00]">
        {/* Green Smoke Animation */}
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.3 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_100%,_#39ff14_0%,_transparent_60%)] mix-blend-screen mix-blend-color-dodge blur-3xl z-10"
        />

        <h1 className="text-4xl glitch-text text-[var(--neon-green)] font-black z-20 mt-4" data-text="LUIGI">
            LUIGI
        </h1>
        <p className="text-[#39ff14] text-center font-mono text-xs mt-2 z-20 opacity-80 uppercase">
            Certified Poppy Chemist
        </p>

        <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #39ff14" }}
            whileTap={{ scale: 0.95 }}
            className="mt-12 w-full max-w-sm bg-[#003300] border-2 border-[#39ff14] rounded-xl p-6 flex flex-col items-center gap-4 relative z-20 overflow-hidden group"
        >
            <Beaker size={48} className="text-[#39ff14] group-hover:spin-slow" />
            <span className="font-mono font-bold text-[#39ff14] text-xl">ENTER POPPY LAB</span>
        </motion.button>
    </div>
);

const PeachProfile = () => {
    const { coins, removeCoins } = useAppStore();
    const [unlocked, setUnlocked] = useState(false);

    const handleUnlock = () => {
        if (!unlocked && coins >= 10000) {
            removeCoins(10000);
            setUnlocked(true);
        }
    };

    return (
        <div className="w-full h-full min-h-[70vh] flex flex-col items-center p-6 bg-[#1a000d]">
            <h1 className="text-4xl glitch-text text-[var(--neon-pink)] font-black" data-text="PEACH">
                PEACH
            </h1>
            <p className="text-[var(--neon-pink)] font-mono text-xs mt-1 mb-8">@PrincessPeach_OF</p>

            <div className="w-full max-w-sm border-2 border-[var(--neon-pink)] rounded-xl overflow-hidden relative shadow-[0_0_15px_rgba(255,42,133,0.3)] bg-black">
                {/* Placeholder image representation */}
                <div
                    className={`w-full aspect-square bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600')] bg-cover bg-center transition-all duration-1000 ${unlocked ? 'filter-none grayscale-0' : 'blur-xl grayscale brightness-50'}`}
                />

                <AnimatePresence>
                    {!unlocked && (
                        <motion.div
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10"
                        >
                            <Lock size={40} className="text-[var(--neon-pink)] mb-4" />
                            <p className="font-mono text-white text-sm mb-4">EXCLUSIVE CONTENT LOCKED</p>
                            <button
                                onClick={handleUnlock}
                                disabled={coins < 10000}
                                className="bg-[var(--neon-pink)] text-white font-bold font-mono px-6 py-3 rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                            >
                                Unlock for $10,000
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {unlocked && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-4 right-4 bg-black/80 rounded-full p-2">
                        <Unlock size={20} className="text-[var(--neon-pink)]" />
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const ToadProfile = () => (
    <div className="w-full h-full min-h-[70vh] flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
        {/* Screen Shake effect logic is simulated via framer motion */}
        <motion.div
            animate={{
                x: [0, -5, 5, -5, 5, 0, -2, 2, 0],
                y: [0, 2, -2, 2, -2, 0, 1, -1, 0]
            }}
            transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatDelay: Math.random() * 2 + 1
            }}
            className="flex flex-col items-center w-full relative z-20"
        >
            <h1 className="text-5xl font-black text-red-600 mb-2 tracking-tighter" style={{ textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000' }}>
                TOAD
            </h1>
            <p className="text-black font-mono font-bold bg-yellow-300 px-2 uppercase text-sm -rotate-3 mb-8">
                Need... more... crystals...
            </p>

            {/* Polka Dot Background */}
            <div
                className="absolute inset-0 w-[200vw] h-[200vh] -top-[50vh] -left-[50vw] pointer-events-none opacity-20 -z-10"
                style={{
                    backgroundImage: 'radial-gradient(red 20%, transparent 20%)',
                    backgroundSize: '40px 40px',
                    backgroundPosition: '0 0, 20px 20px'
                }}
            />

            <div className="w-40 h-40 bg-white rounded-full border-[10px] border-red-600 relative flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.5)]">
                <div className="w-16 h-16 bg-red-600 rounded-full absolute top-2 left-6" />
                <div className="w-12 h-12 bg-red-600 rounded-full absolute bottom-4 right-4" />
                <div className="w-8 h-8 bg-red-600 rounded-full absolute top-8 right-6" />
            </div>

        </motion.div>
    </div>
);

const CharacterPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const renderProfile = () => {
        switch (id) {
            case 'mario': return <MarioProfile />;
            case 'luigi': return <LuigiProfile />;
            case 'peach': return <PeachProfile />;
            case 'toad': return <ToadProfile />;
            default: return <div className="text-white p-4">Character not found</div>;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-50 bg-black/50 p-2 rounded-full backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
            >
                <ArrowLeft size={24} className="text-white" />
            </button>
            {renderProfile()}
        </div>
    );
};

export default CharacterPage;
