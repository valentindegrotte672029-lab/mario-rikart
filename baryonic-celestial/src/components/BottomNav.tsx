import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Car, Beaker, Wine, MessageSquareWarning } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Garage', path: '/', icon: Car, color: 'var(--text-primary)' },
        { name: 'Mixer', path: '/mixer', icon: Beaker, color: 'var(--neon-green)' },
        { name: "Wario's", path: '/warios', icon: Wine, color: 'var(--coin-gold)' },
        { name: 'Leaks', path: '/leaks', icon: MessageSquareWarning, color: 'var(--neon-pink)' },
    ];

    return (
        <div className="bottom-nav-container">
            <div className="bottom-nav-inner">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/character/'));
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <div className="nav-icon-wrapper">
                                <Icon
                                    size={24}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    color={isActive ? item.color : 'var(--text-muted)'}
                                    className={isActive ? 'nav-icon-active' : ''}
                                />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-indicator"
                                        className="nav-indicator"
                                        style={{ backgroundColor: item.color }}
                                    />
                                )}
                            </div>
                            <span
                                className={`nav-label ${isActive ? 'active' : ''}`}
                                style={{ color: isActive ? item.color : undefined }}
                            >
                                {item.name}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </div>
    );
};
