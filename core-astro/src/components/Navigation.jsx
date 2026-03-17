import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../store/useStore';

const ICON_ASSET_VERSION = '20260317-2';

const PAGES = [
    { id: 'WARIO',  iconSrc: '/images/icons/nav/wario-icon.png',  label: 'Bar',      color: '#ffcc00' },
    { id: 'TOAD',   iconSrc: '/images/icons/nav/toad-icon.png',   label: 'Bank',     color: '#9933ff' },
    { id: 'PEACH',  iconSrc: '/images/icons/nav/peach-icon.png',  label: 'Peach',    color: '#ff66b2' },
    { id: 'LUIGI',  iconSrc: '/images/icons/nav/luidgi-icon.png', label: 'Arcade',   color: '#39ff14' },
    { id: 'MARIO',  iconSrc: '/images/icons/nav/mario-icon.png',  label: 'BeMario',  color: '#ff3333' },
    { id: 'CHRONO', iconSrc: '/images/icons/nav/poppy-icon.png',  label: 'Poppy',    color: '#ff9900' },
    { id: 'CASINO', iconSrc: '/images/icons/nav/poker-icon.png',  label: 'Casino',   color: '#ff00ff' },
    { id: 'TROMBI', iconSrc: '/images/icons/nav/trombi-icon.png', label: 'Trombi',   color: '#ff6633' },
    { id: 'PSYCH',  iconSrc: '/images/icons/nav/test-icon.png',   label: 'Test',     color: '#00ffff' },
];

export default function Navigation() {
    const { currentPage, setPage, resetSpeed } = useStore();

    const handleNavigate = (page) => {
        if (page === currentPage) return;
        setPage(page);
        setTimeout(() => resetSpeed(), 1200);
    };

    return (
        <>
            <nav className="snap-bottom-nav">
                {PAGES.map(({ id, iconSrc, label, color }) => {
                    const isActive = currentPage === id;
                    return (
                        <motion.button
                            key={id}
                            onClick={() => handleNavigate(id)}
                            className={`snap-nav-item ${isActive ? 'active' : ''}`}
                            whileTap={{ scale: 0.85 }}
                        >
                            <span className={`snap-nav-icon ${isActive ? 'active' : ''}`}>
                                <img src={`${iconSrc}?v=${ICON_ASSET_VERSION}`} alt={label} className="snap-nav-icon-img" />
                            </span>
                            {isActive && (
                                <motion.span
                                    className="snap-nav-label"
                                    style={{ color }}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {label}
                                </motion.span>
                            )}
                            {isActive && (
                                <motion.div
                                    className="snap-nav-dot"
                                    layoutId="snapNavDot"
                                    style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </nav>

            <style>{`
                .snap-bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    height: calc(60px + env(safe-area-inset-bottom, 0px));
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                    background: rgba(8, 8, 16, 0.88);
                    backdrop-filter: blur(20px) saturate(1.6);
                    -webkit-backdrop-filter: blur(20px) saturate(1.6);
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    z-index: 100;
                    pointer-events: auto;
                    touch-action: none;
                }

                .snap-nav-item {
                    position: relative;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 6px 0;
                    -webkit-tap-highlight-color: transparent;
                    outline: none;
                    min-height: 48px;
                }

                .snap-nav-icon {
                    width: 26px;
                    height: 26px;
                    filter: grayscale(0.8) brightness(0.5);
                    transition: all 0.2s ease;
                    line-height: 1;
                    transform: scale(1);
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .snap-nav-icon-img {
                    width: 92%;
                    height: 92%;
                    object-fit: contain;
                    display: block;
                }
                .snap-nav-item.active .snap-nav-icon {
                    filter: none;
                    transform: scale(1.1);
                }

                .snap-nav-label {
                    font-size: 0.55rem;
                    font-weight: 800;
                    letter-spacing: 0.3px;
                    text-transform: uppercase;
                    white-space: nowrap;
                    line-height: 1;
                }

                .snap-nav-dot {
                    position: absolute;
                    bottom: 2px;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                }
            `}</style>
        </>
    );
}

export { PAGES };
