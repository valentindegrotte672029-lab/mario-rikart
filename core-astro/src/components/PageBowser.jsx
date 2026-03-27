import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { socket } from '../socket';
import NeonIcon from './NeonIcon';

const BOWSER_ITEMS = [
    { id: 'clope', name: 'Une Clope', icon: '/images/clope-neon.png', price: 0 },
    { id: 'joint', name: 'Un Joint', icon: '/images/joint-neon.png', price: 0 },
    { id: 'poppy', name: 'Snif de Poppy', icon: '/images/poppy-neon.png', price: 0 },
];

export default function PageBowser() {
    const { username, lastBowserOrder, setLastBowserOrder } = useStore();
    const [cooldown, setCooldown] = useState(0);
    const [successMsg, setSuccessMsg] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const checkCooldown = () => {
            if (!lastBowserOrder) {
                setCooldown(0);
                return;
            }
            const last = new Date(lastBowserOrder);
            const now = new Date();
            const diffMs = now - last;
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 60) {
                setCooldown(60 - diffMins);
            } else {
                setCooldown(0);
            }
        };

        checkCooldown();
        const timer = setInterval(checkCooldown, 30000); // Check every 30s
        return () => clearInterval(timer);
    }, [lastBowserOrder]);

    useEffect(() => {
        const handleError = (msg) => {
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(null), 5000);
        };
        socket.on('bowser_error', handleError);
        return () => socket.off('bowser_error', handleError);
    }, []);

    const handleOrder = (item) => {
        if (cooldown > 0) return;

        socket.emit('new_order', {
            type: 'BOWSER',
            item: item.name,
            price: 0,
            id: item.id,
            username: username,
            note: `Commande Bowser : ${item.name}`
        });

        const now = new Date();
        setLastBowserOrder(now.toISOString());
        setCooldown(60);
        setSuccessMsg(`Commande envoyée : ${item.name} !`);
        setTimeout(() => setSuccessMsg(null), 5000);

        if (window.navigator?.vibrate) window.navigator.vibrate([50, 30, 50]);
    };

    return (
        <motion.div 
            className="page-bowser"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="bowser-hero">
                <img src="/images/bowser-neon.png" alt="Bowser" className="bowser-logo-large" />
                <h1 className="bowser-title">HALLO BOWSER</h1>
                <p className="bowser-subtitle">L'ESPACE DÉTENTE DU ROI DES KOOPAS</p>
            </div>

            <AnimatePresence>
                {successMsg && (
                    <motion.div className="bowser-alert success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                        <NeonIcon name="check-neon" size={18} /> {successMsg}
                    </motion.div>
                )}
                {errorMsg && (
                    <motion.div className="bowser-alert error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                        <NeonIcon name="warning-triangle" size={18} /> {errorMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bowser-grid">
                {BOWSER_ITEMS.map((item) => (
                    <motion.button
                        key={item.id}
                        className={`bowser-item-card ${cooldown > 0 ? 'disabled' : ''}`}
                        onClick={() => handleOrder(item)}
                        whileHover={cooldown === 0 ? { scale: 1.02, y: -5 } : {}}
                        whileTap={cooldown === 0 ? { scale: 0.95 } : {}}
                    >
                        <div className="bowser-item-icon">
                            <img src={item.icon} alt={item.name} />
                        </div>
                        <div className="bowser-item-info">
                            <span className="bowser-item-name">{item.name}</span>
                            <span className="bowser-item-price">GRATUIT</span>
                        </div>
                    </motion.button>
                ))}
            </div>

            {cooldown > 0 && (
                <div className="bowser-cooldown-notice">
                    <p>Bowser se repose... Reviens dans <b>{cooldown} min</b> pour une nouvelle commande.</p>
                </div>
            )}

            <style>{`
                .page-bowser {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 25px;
                    padding-bottom: 50px;
                }
                .bowser-hero {
                    text-align: center;
                    margin-top: 10px;
                }
                .bowser-logo-large {
                    width: 140px;
                    filter: drop-shadow(0 0 20px rgba(255, 68, 0, 0.6));
                    margin-bottom: 10px;
                }
                .bowser-title {
                    font-family: 'Knewave', cursive;
                    font-size: 2.8rem;
                    color: #ff4400;
                    text-shadow: 0 0 15px rgba(255, 68, 0, 0.8), 2px 2px #000;
                    margin: 0;
                    letter-spacing: 2px;
                }
                .bowser-subtitle {
                    color: #aaa;
                    font-size: 0.8rem;
                    font-weight: 800;
                    letter-spacing: 3px;
                    margin-top: 5px;
                }
                .bowser-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 15px;
                    width: 100%;
                }
                .bowser-item-card {
                    background: rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 68, 0, 0.3);
                    border-radius: 20px;
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: left;
                }
                .bowser-item-card.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    filter: grayscale(1);
                    border-color: #333;
                }
                .bowser-item-icon {
                    width: 70px;
                    height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bowser-item-icon img {
                    max-width: 100%;
                    max-height: 100%;
                    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.4));
                }
                .bowser-item-info {
                    display: flex;
                    flex-direction: column;
                }
                .bowser-item-name {
                    font-size: 1.2rem;
                    font-weight: 900;
                    color: #fff;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                }
                .bowser-item-price {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: #ffee00;
                }
                .bowser-alert {
                    padding: 12px 20px;
                    border-radius: 12px;
                    font-weight: bold;
                    width: 100%;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                .bowser-alert.success { background: rgba(57, 255, 20, 0.2); border: 1px solid #39ff14; color: #39ff14; }
                .bowser-alert.error { background: rgba(255, 0, 0, 0.2); border: 1px solid #ff0000; color: #ff0000; }
                .bowser-cooldown-notice {
                    background: rgba(255, 68, 0, 0.1);
                    border-left: 4px solid #ff4400;
                    padding: 10px 15px;
                    border-radius: 8px;
                    color: #ccc;
                    font-size: 0.9rem;
                }
                .bowser-cooldown-notice b { color: #ff4400; }
            `}</style>
        </motion.div>
    );
}

