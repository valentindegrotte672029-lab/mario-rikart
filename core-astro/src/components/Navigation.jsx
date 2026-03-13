import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const PAGES = [
    { id: 'LUIGI',  icon: '🎮', label: 'Arcade',  color: '#39ff14' },
    { id: 'TOAD',   icon: '🏦', label: 'Bank',     color: '#9933ff' },
    { id: 'PEACH',  icon: '🔥', label: 'Peach',    color: '#ff66b2' },
    { id: 'MARIO',  icon: '📸', label: 'BeMario',  color: '#ff3333' },
    { id: 'WARIO',  icon: '🍺', label: 'Barnaque', color: '#ffcc00' },
    { id: 'CHRONO', icon: '⏱️', label: 'Poppy',    color: '#ff9900' },
    { id: 'PSYCH',  icon: '🧠', label: 'Le Test',  color: '#00ffff' },
    { id: 'CASINO', icon: '💎', label: 'Paris',    color: '#ff00ff' },
    { id: 'POKER',  icon: '♠️', label: 'Poker',    color: '#00ff66' },
];

export default function Navigation() {
    const { currentPage, setPage, resetSpeed } = useStore();
    const scrollRef = useRef(null);

    const handleNavigate = (page) => {
        if (page === currentPage) return;
        setPage(page);
        setTimeout(() => resetSpeed(), 1200);
    };

    // Auto-scroll to active tab
    useEffect(() => {
        if (!scrollRef.current) return;
        const activeBtn = scrollRef.current.querySelector('.nav-tab.active');
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [currentPage]);

    const activeIdx = PAGES.findIndex(p => p.id === currentPage);
    const activeColor = PAGES[activeIdx]?.color || '#fff';

    return (
        <>
            {/* Snapchat-style dot indicators at very top of content */}
            {activeIdx >= 0 && (
                <div className="snap-dots">
                    {PAGES.map((p, i) => (
                        <div
                            key={p.id}
                            className={`snap-dot ${i === activeIdx ? 'active' : ''}`}
                            style={i === activeIdx ? { background: activeColor, boxShadow: `0 0 8px ${activeColor}` } : {}}
                        />
                    ))}
                </div>
            )}

            {/* Bottom tab bar */}
            <nav className="nav-dock" ref={scrollRef}>
                {PAGES.map(({ id, icon, label, color }) => {
                    const isActive = currentPage === id;
                    return (
                        <motion.button
                            key={id}
                            onClick={() => handleNavigate(id)}
                            className={`nav-tab ${isActive ? 'active' : ''}`}
                            whileTap={{ scale: 0.88 }}
                        >
                            <span className="nav-tab-icon" style={isActive ? { filter: 'none' } : {}}>{icon}</span>
                            <span className="nav-tab-label" style={isActive ? { color, opacity: 1 } : {}}>{label}</span>
                            {isActive && (
                                <motion.div
                                    className="nav-tab-bar"
                                    layoutId="activeTabBar"
                                    style={{ background: color, boxShadow: `0 0 12px ${color}` }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            <style>{`
                .snap-dots {
                    position: fixed;
                    top: calc(env(safe-area-inset-top, 0px) + 62px);
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 6px;
                    z-index: 110;
                    pointer-events: none;
                }
                .snap-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.25);
                    transition: all 0.3s ease;
                }
                .snap-dot.active {
                    width: 20px;
                    border-radius: 4px;
                }

                .nav-dock {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: flex-end;
                    overflow-x: auto;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    height: 76px;
                    padding: 0 4px;
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                    background: rgba(10, 10, 25, 0.78);
                    backdrop-filter: blur(24px) saturate(1.8);
                    -webkit-backdrop-filter: blur(24px) saturate(1.8);
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    z-index: 100;
                    pointer-events: auto;
                }
                .nav-dock::-webkit-scrollbar { display: none; }

                .nav-tab {
                    position: relative;
                    flex: 0 0 auto;
                    min-width: 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 8px 10px 10px;
                    -webkit-tap-highlight-color: transparent;
                }

                .nav-tab-icon {
                    font-size: 1.5rem;
                    filter: grayscale(0.7) brightness(0.55);
                    transition: all 0.25s ease;
                }
                .nav-tab.active .nav-tab-icon {
                    font-size: 1.7rem;
                    filter: none;
                }

                .nav-tab-label {
                    font-size: 0.6rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    color: rgba(255,255,255,0.35);
                    text-transform: uppercase;
                    opacity: 0.6;
                    transition: all 0.25s ease;
                    white-space: nowrap;
                }

                .nav-tab-bar {
                    position: absolute;
                    top: 0;
                    left: 15%;
                    right: 15%;
                    height: 3px;
                    border-radius: 0 0 3px 3px;
                }
            `}</style>
        </>
    );
}

export { PAGES };
