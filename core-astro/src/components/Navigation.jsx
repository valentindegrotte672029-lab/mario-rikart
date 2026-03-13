import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

export default function Navigation() {
    const { currentPage, setPage, resetSpeed } = useStore();

    const pages = [
        { id: 'LUIGI', icon: '🟢' },
        { id: 'TOAD',  icon: '🍄' },
        { id: 'PEACH', icon: '👑' },
        { id: 'MARIO', icon: '🔴' },
        { id: 'WARIO', icon: '🟡' },
    ];

    const handleNavigate = (page) => {
        if (page === currentPage) return;
        setPage(page);
        setTimeout(() => resetSpeed(), 1200);
    };

    return (
        <nav className="nav-dock">
            {pages.map(({ id, icon }) => (
                <motion.button
                    key={id}
                    onClick={() => handleNavigate(id)}
                    className={`nav-icon ${currentPage === id ? 'active' : ''}`}
                    whileTap={{ scale: 0.85 }}
                >
                    <span className="nav-emoji">{icon}</span>
                    {currentPage === id && (
                        <motion.div
                            className="nav-glow"
                            layoutId="nav-indicator"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                    )}
                </motion.button>
            ))}

            <style>{`
                .nav-dock {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    height: 72px;
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                    background: rgba(15, 15, 30, 0.65);
                    backdrop-filter: blur(20px) saturate(1.8);
                    -webkit-backdrop-filter: blur(20px) saturate(1.8);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    z-index: 100;
                    pointer-events: auto;
                }

                .nav-icon {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: 16px;
                    -webkit-tap-highlight-color: transparent;
                    transition: transform 0.2s ease;
                }

                .nav-emoji {
                    font-size: 1.8rem;
                    filter: grayscale(0.6) brightness(0.7);
                    transition: all 0.3s ease;
                }

                .nav-icon.active .nav-emoji {
                    font-size: 2.2rem;
                    filter: grayscale(0) brightness(1.1);
                }

                .nav-glow {
                    position: absolute;
                    inset: -4px;
                    border-radius: 18px;
                    background: radial-gradient(circle, rgba(0, 255, 204, 0.25) 0%, transparent 70%);
                    box-shadow: 0 0 20px rgba(0, 255, 204, 0.3), inset 0 0 15px rgba(0, 255, 204, 0.1);
                    z-index: -1;
                    animation: neonPulse 2s ease-in-out infinite alternate;
                }

                @keyframes neonPulse {
                    0% {
                        opacity: 0.6;
                        box-shadow: 0 0 15px rgba(0, 255, 204, 0.2), inset 0 0 10px rgba(0, 255, 204, 0.05);
                    }
                    100% {
                        opacity: 1;
                        box-shadow: 0 0 25px rgba(0, 255, 204, 0.5), inset 0 0 20px rgba(0, 255, 204, 0.15);
                    }
                }
            `}</style>
        </nav>
    );
}
