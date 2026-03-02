import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const characters = [
    { id: 'mario', name: 'Mario', subtitle: 'Depressed Plumber', color: 'var(--mario-red)', bg: '#3a0000' },
    { id: 'luigi', name: 'Luigi', subtitle: 'Poppy Chemist', color: 'var(--luigi-green)', bg: '#002600' },
    { id: 'peach', name: 'Peach', subtitle: 'Content Creator', color: 'var(--peach-pink)', bg: '#33001a' },
    { id: 'toad', name: 'Toad', subtitle: 'Crack Addict', color: '#ffcc00', bg: '#332b00' },
];

const Garage: React.FC = () => {
    return (
        <div className="p-4 flex flex-col items-center min-h-[70vh] w-full max-w-md mx-auto relative">
            <div className="mb-6 w-full text-center">
                <h1 className="text-3xl glitch-text font-black tracking-tighter" data-text="THE GARAGE">
                    THE GARAGE
                </h1>
                <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">Select your subject</p>
            </div>

            <div className="w-full flex flex-col gap-4">
                {characters.map((char, index) => (
                    <Link to={`/character/${char.id}`} key={char.id} className="w-full">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="w-full p-4 rounded-xl border relative overflow-hidden group flex items-center justify-between"
                            style={{
                                backgroundColor: char.bg,
                                borderColor: `${char.color}40`,
                                boxShadow: `0 4px 20px ${char.color}15`
                            }}
                        >
                            {/* Background gradient overlay */}
                            <div
                                className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
                                style={{ background: `linear-gradient(90deg, transparent, ${char.color}, transparent)` }}
                            />

                            <div className="relative z-10">
                                <h2
                                    className="font-mono text-2xl font-bold uppercase italic"
                                    style={{ color: char.color, textShadow: `0 0 10px ${char.color}80` }}
                                >
                                    {char.name}
                                </h2>
                                <p className="text-gray-300 font-sans text-sm">{char.subtitle}</p>
                            </div>

                            <div className="relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center bg-black/50" style={{ borderColor: char.color }}>
                                <span style={{ color: char.color }}>→</span>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Garage;
