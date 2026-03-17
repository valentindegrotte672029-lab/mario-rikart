import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeonIcon from './NeonIcon';

// Each pole = one group photo with face rects + name text rects (all in % of image)
// Coordinates from rendered reference PDF with precise black rectangle positions
const POLES = [
    {
        name: 'Présidence',
        emoji: null,
        icon: 'peach-crown',
        color: '#ffcc00',
        photo: '/images/trombi/page_1.jpg',
        description: 'Le pôle Présidence dirige le BDE, coordonne tous les autres pôles et représente les étudiants auprès de l\'administration.',
        members: [
            { name: 'Lucas Tribut', role: 'Président', face: { x: 20.4, y: 43.1, w: 20.7, h: 18.2 }, text: { x: 2.3, y: 67.9, w: 30.3, h: 3.4 } },
            { name: 'Estelle Bouillet', role: 'Vice-Présidente', face: { x: 57.5, y: 56.6, w: 20.7, h: 14 }, text: { x: 57.5, y: 73.5, w: 37.2, h: 3.3 } },
        ]
    },
    {
        name: 'Secrétariat',
        emoji: null,
        icon: 'lock-neon',
        color: '#00ccff',
        photo: '/images/trombi/page_2.jpg',
        description: 'Le pôle Secrétariat gère toute la paperasse, les comptes-rendus, la communication interne et les procès-verbaux.',
        members: [
            { name: 'Inès Ennadif', role: 'Secrétaire', face: { x: 17.9, y: 34.6, w: 22.8, h: 20.7 }, text: { x: 7.2, y: 77.8, w: 33.6, h: 3.2 } },
            { name: 'Thomas Dubuc', role: 'Head Secrétaire', face: { x: 52.6, y: 31.8, w: 32.1, h: 20.7 }, text: { x: 58.3, y: 78.2, w: 33.6, h: 3.2 } },
        ]
    },
    {
        name: 'Trésorerie',
        emoji: null,
        icon: 'coins-stack',
        color: '#39ff14',
        photo: '/images/trombi/page_3.jpg',
        description: 'Le pôle Trésorerie gère le budget du BDE, les encaissements, les dépenses et s\'assure que les comptes sont en ordre.',
        members: [
            { name: 'Mateo Cavaloc', role: 'Trésorier', face: { x: 16.8, y: 51.2, w: 27.4, h: 18.5 }, text: { x: 14.2, y: 88.4, w: 21.4, h: 1.8 } },
            { name: 'Kylian Libouban', role: 'Head Trésorier', face: { x: 55.6, y: 50, w: 26.3, h: 17.5 }, text: { x: 57.8, y: 84, w: 23.2, h: 2.4 } },
        ]
    },
    {
        name: 'Ambassade',
        emoji: null,
        icon: 'castle-gothic-purple',
        color: '#ff66b2',
        photo: '/images/trombi/page_4.jpg',
        description: 'Le pôle Ambassade représente le BDE à l\'extérieur, gère les relations avec les autres écoles et associations.',
        members: [
            { name: 'Alexandre Hofherr', role: 'Ambassadeur', face: { x: 27.1, y: 32.6, w: 21.2, h: 11.6 }, text: { x: 18.8, y: 70, w: 27, h: 9.9 } },
            { name: 'Emma Gomes', role: 'Head Ambassadrice', face: { x: 69, y: 47.2, w: 20.9, h: 12.2 }, text: { x: 63.3, y: 73.7, w: 19.7, h: 10.5 } },
        ]
    },
    {
        name: 'Communication',
        emoji: null,
        icon: 'trombi-com',
        color: '#ff4400',
        photo: '/images/trombi/page_5.jpg',
        description: 'Le pôle Communication gère les réseaux sociaux, les affiches, les vidéos et toute la visibilité du BDE.',
        members: [
            { name: 'Valentin Degrotte', role: 'Communication', face: { x: 14, y: 61.2, w: 23.5, h: 13.3 }, text: { x: 3.6, y: 94.5, w: 33.9, h: 2 } },
            { name: 'Maxime Blood', role: 'Head Communication', face: { x: 56, y: 58, w: 24.3, h: 17.6 }, text: { x: 36.9, y: 89.6, w: 25, h: 1.9 } },
        ]
    },
    {
        name: 'Événementiel',
        emoji: null,
        icon: 'trombi-event',
        color: '#ff00ff',
        photo: '/images/trombi/page_6.jpg',
        description: 'Le pôle Événementiel organise toutes les soirées, galas, afterworks et événements de la vie étudiante.',
        members: [
            { name: 'Victoire Callens', role: 'Head Événementiel', face: { x: 14.3, y: 45.9, w: 23.8, h: 16.4 }, text: { x: 12.6, y: 78.6, w: 27.2, h: 13.1 } },
            { name: 'Hanaé Lemoine', role: 'Événementiel', face: { x: 59.5, y: 44.7, w: 19.2, h: 16.5 }, text: { x: 55.8, y: 77.9, w: 27.6, h: 13.1 } },
        ]
    },
    {
        name: 'Animations',
        emoji: null,
        icon: 'question-block',
        color: '#9933ff',
        photo: '/images/trombi/page_7.jpg',
        description: 'Le pôle Animations organise les activités ludiques, tournois, jeux et animations pendant les temps de pause.',
        members: [
            { name: 'Edouard Souied', role: 'Animations', face: { x: 22.5, y: 58.2, w: 21.2, h: 14.4 }, text: { x: 7.4, y: 88.5, w: 19.4, h: 1.7 } },
            { name: 'Adek Roussel', role: 'Animations', face: { x: 66.4, y: 62.7, w: 15.4, h: 11.2 }, text: { x: 72.1, y: 88.5, w: 19.4, h: 1.9 } },
            { name: 'Alyxane Lefèvre-Böhm', role: 'Head Animations', face: { x: 49, y: 65.3, w: 15.4, h: 11.3 }, text: { x: 38.1, y: 92.9, w: 21.7, h: 3.1 } },
        ]
    },
    {
        name: 'Logistique',
        emoji: null,
        icon: 'treasure-chest',
        color: '#00ff88',
        photo: '/images/trombi/page_8.jpg',
        description: 'Le pôle Logistique gère l\'organisation matérielle des événements, la logistique et les approvisionnements.',
        members: [
            { name: 'Baptiste Dubreuil', role: 'Head Logistique', face: { x: 21.5, y: 44.5, w: 10.9, h: 11.2 }, text: { x: 19.8, y: 61.7, w: 9, h: 2.4 } },
            { name: 'Aurélien Malige', role: 'Logistique', face: { x: 69.9, y: 43.1, w: 9.4, h: 8 }, text: { x: 72.4, y: 60, w: 7.3, h: 2.4 } },
            { name: 'Salomé Valmorin', role: 'Logistique', face: { x: 48.5, y: 50.8, w: 9, h: 8 }, text: { x: 48.6, y: 65.8, w: 7.7, h: 2.4 } },
        ]
    },
    {
        name: 'Travel',
        emoji: null,
        icon: 'trombi-travel',
        color: '#00ccff',
        photo: '/images/trombi/page_9.jpg',
        description: 'Le pôle Travel organise les voyages étudiants, week-ends d\'intégration et escapades. Direction : l\'aventure.',
        members: [
            { name: 'Salomé Nathan', role: 'Head Travel', face: { x: 46, y: 46.3, w: 7.9, h: 9.3 }, text: { x: 40.8, y: 81.9, w: 27.6, h: 3.3 } },
        ]
    },
];

export default function PageTrombi() {
    const [revealed, setRevealed] = useState(new Set());
    const [showInfo, setShowInfo] = useState(null);

    const memberKey = (pi, mi) => `${pi}-${mi}`;
    const totalMembers = POLES.reduce((acc, p) => acc + p.members.length, 0);
    const allRevealed = revealed.size === totalMembers;

    const handleTapRect = (e, poleIdx, memberIdx) => {
        e.stopPropagation();
        setShowInfo({ poleIdx, memberIdx });
    };

    const handleCloseInfo = () => {
        if (showInfo) {
            setRevealed(prev => new Set([...prev, memberKey(showInfo.poleIdx, showInfo.memberIdx)]));
            setShowInfo(null);
        }
    };

    const renderRect = (rect, pi, mi, className) => (
        <motion.div
            className={`trombi-black-rect ${className}`}
            style={{
                left: `${rect.x}%`,
                top: `${rect.y}%`,
                width: `${rect.w}%`,
                height: `${rect.h}%`,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => handleTapRect(e, pi, mi)}
        />
    );

    return (
        <motion.div
            className="page-trombi"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="trombi-header">
                <h1 className="trombi-title"><NeonIcon name="newspaper-neon" size={24} /> EPSTEIN FILES</h1>
                <p className="trombi-subtitle">LISTE TRIBUT-BOUILLET — CLASSIFIÉ</p>
                <p className="trombi-counter">{revealed.size}/{totalMembers} identités révélées</p>
            </div>

            {allRevealed && (
                <motion.div className="trombi-congrats" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <p style={{ fontSize: '2.5rem' }}><NeonIcon name="lock-neon" size={48} /></p>
                    <h2 style={{ color: '#ffcc00' }}>DOSSIER COMPLET</h2>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Toutes les identités ont été déclassifiées.</p>
                </motion.div>
            )}

            {POLES.map((pole, pi) => (
                <div key={pi} className="trombi-pole-section">
                    <div className="trombi-pole-header" style={{ borderColor: pole.color }}>
                        <span>{pole.icon ? <NeonIcon name={pole.icon} size={22} /> : pole.emoji}</span>
                        <span style={{ color: pole.color }}>{pole.name}</span>
                    </div>
                    <div className="trombi-photo-container">
                        <img src={pole.photo} alt={pole.name} className="trombi-group-photo" />
                        {pole.members.map((member, mi) => {
                            const key = memberKey(pi, mi);
                            const isRevealed = revealed.has(key);
                            if (isRevealed) return null;
                            return (
                                <React.Fragment key={key}>
                                    {renderRect(member.face, pi, mi, 'trombi-face-rect')}
                                    {renderRect(member.text, pi, mi, 'trombi-text-rect')}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            ))}

            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        className="trombi-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseInfo}
                    >
                        <motion.div
                            className="trombi-modal"
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="trombi-modal-pole" style={{ color: POLES[showInfo.poleIdx].color }}>
                                {POLES[showInfo.poleIdx].icon ? <NeonIcon name={POLES[showInfo.poleIdx].icon} size={20} /> : POLES[showInfo.poleIdx].emoji} {POLES[showInfo.poleIdx].name}
                            </div>
                            <p className="trombi-modal-desc">{POLES[showInfo.poleIdx].description}</p>
                            <p className="trombi-modal-role">
                                Rôle : <b style={{ color: POLES[showInfo.poleIdx].color }}>
                                    {POLES[showInfo.poleIdx].members[showInfo.memberIdx].role}
                                </b>
                            </p>
                            <button className="trombi-modal-close" onClick={handleCloseInfo}>
                                DÉCLASSIFIER <NeonIcon name="lock-neon" size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .page-trombi {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    padding: 0 0 40px 0;
                }
                .trombi-header {
                    text-align: center;
                    padding: 20px 16px;
                    background: rgba(255,100,50,0.08);
                    border: 2px solid rgba(255,100,50,0.3);
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                }
                .trombi-title {
                    font-size: 2rem;
                    font-weight: 900;
                    color: #ff6633;
                    margin: 0;
                    text-shadow: 0 0 10px rgba(255,100,50,0.5);
                    letter-spacing: 2px;
                }
                .trombi-subtitle {
                    color: #ffcc00;
                    font-size: 0.8rem;
                    font-weight: bold;
                    letter-spacing: 3px;
                    margin-top: 4px;
                    text-transform: uppercase;
                }
                .trombi-counter {
                    color: #888;
                    font-size: 0.85rem;
                    margin-top: 8px;
                }
                .trombi-congrats {
                    text-align: center;
                    padding: 24px;
                    background: rgba(255,204,0,0.08);
                    border: 2px solid rgba(255,204,0,0.3);
                    border-radius: 16px;
                }
                .trombi-pole-section {
                    margin-bottom: 8px;
                }
                .trombi-pole-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-left: 4px solid;
                    font-weight: 900;
                    font-size: 1.1rem;
                    margin-bottom: 8px;
                }
                .trombi-photo-container {
                    position: relative;
                    width: 100%;
                    border-radius: 12px;
                    overflow: hidden;
                    border: 2px solid rgba(255,255,255,0.1);
                    background: #000;
                }
                .trombi-group-photo {
                    display: block;
                    width: 100%;
                    height: auto;
                }
                .trombi-black-rect {
                    position: absolute;
                    background: #000;
                    cursor: pointer;
                    z-index: 2;
                }
                .trombi-face-rect {
                    border: 1px solid #222;
                }
                .trombi-text-rect {
                    border: none;
                }
                .trombi-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.85);
                    z-index: 200;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .trombi-modal {
                    background: #1a1a2e;
                    border: 2px solid rgba(255,255,255,0.15);
                    border-radius: 20px;
                    padding: 30px 24px;
                    max-width: 340px;
                    width: 100%;
                    text-align: center;
                }
                .trombi-modal-pole {
                    font-size: 1.4rem;
                    font-weight: 900;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                .trombi-modal-desc {
                    color: #ccc;
                    font-size: 0.9rem;
                    line-height: 1.5;
                    margin-bottom: 16px;
                }
                .trombi-modal-role {
                    color: #aaa;
                    font-size: 0.95rem;
                    margin-bottom: 20px;
                }
                .trombi-modal-close {
                    padding: 12px 28px;
                    border-radius: 14px;
                    border: 2px solid #ffcc00;
                    background: rgba(255,204,0,0.1);
                    color: #ffcc00;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                }
                .trombi-modal-close:active {
                    background: rgba(255,204,0,0.25);
                }
            `}</style>
        </motion.div>
    );
}
