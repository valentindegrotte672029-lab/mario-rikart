import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Each pole = one group photo (full PDF page) with face positions as percentages
const POLES = [
    {
        name: 'Présidence',
        emoji: '👑',
        color: '#ffcc00',
        photo: '/images/trombi/page_1.jpg',
        description: 'Le pôle Présidence dirige le BDE, coordonne tous les autres pôles et représente les étudiants auprès de l\'administration.',
        members: [
            { name: 'Lucas Tribut', role: 'Président', x: 22, y: 43, w: 22, h: 16 },
            { name: 'Estelle Bouillet', role: 'Vice-Présidente', x: 57, y: 55, w: 18, h: 13 },
        ]
    },
    {
        name: 'Secrétariat',
        emoji: '📋',
        color: '#00ccff',
        photo: '/images/trombi/page_2.jpg',
        description: 'Le pôle Secrétariat gère toute la paperasse, les comptes-rendus, la communication interne et les procès-verbaux.',
        members: [
            { name: 'Inès Ennadif', role: 'Secrétaire', x: 18, y: 35, w: 25, h: 18 },
            { name: 'Thomas Dubuc', role: 'Head Secrétaire', x: 56, y: 34, w: 25, h: 18 },
        ]
    },
    {
        name: 'Trésorerie',
        emoji: '💰',
        color: '#39ff14',
        photo: '/images/trombi/page_3.jpg',
        description: 'Le pôle Trésorerie gère le budget du BDE, les encaissements, les dépenses et s\'assure que les comptes sont en ordre.',
        members: [
            { name: 'Mateo Cavaloc', role: 'Trésorier', x: 18, y: 53, w: 20, h: 14 },
            { name: 'Kylian Lib', role: 'Head Trésorier', x: 56, y: 50, w: 20, h: 14 },
        ]
    },
    {
        name: 'Ambassade',
        emoji: '🌍',
        color: '#ff66b2',
        photo: '/images/trombi/page_4.jpg',
        description: 'Le pôle Ambassade représente le BDE à l\'extérieur, gère les relations avec les autres écoles et associations.',
        members: [
            { name: 'Alexandre Hoffherr', role: 'Ambassadeur', x: 18, y: 33, w: 22, h: 15 },
            { name: 'Emma Gomes', role: 'Head Ambassadeur', x: 55, y: 42, w: 22, h: 15 },
        ]
    },
    {
        name: 'Communication',
        emoji: '📢',
        color: '#ff4400',
        photo: '/images/trombi/page_5.jpg',
        description: 'Le pôle Communication gère les réseaux sociaux, les affiches, les vidéos et toute la visibilité du BDE.',
        members: [
            { name: 'Valentin Degrotte', role: 'Communication', x: 13, y: 57, w: 22, h: 15 },
            { name: 'Maxime Bloud', role: 'Head Communication', x: 54, y: 57, w: 24, h: 17 },
        ]
    },
    {
        name: 'Événementiel',
        emoji: '🎉',
        color: '#ff00ff',
        photo: '/images/trombi/page_6.jpg',
        description: 'Le pôle Événementiel organise toutes les soirées, galas, afterworks et événements de la vie étudiante.',
        members: [
            { name: 'Victoire Callens', role: 'Événementiel', x: 14, y: 46, w: 22, h: 14 },
            { name: 'Hanaé Lemoine', role: 'Head Événementiel', x: 60, y: 44, w: 20, h: 14 },
        ]
    },
    {
        name: 'Animations',
        emoji: '🎮',
        color: '#9933ff',
        photo: '/images/trombi/page_7.jpg',
        description: 'Le pôle Animations organise les activités ludiques, tournois, jeux et animations pendant les temps de pause.',
        members: [
            { name: 'Edouard Souied', role: 'Animations', x: 6, y: 62, w: 18, h: 14 },
            { name: 'Radek Roussel', role: 'Animations', x: 72, y: 62, w: 18, h: 14 },
            { name: 'Alyxane Lefèvre Böhm', role: 'Head Animations', x: 38, y: 75, w: 18, h: 14 },
        ]
    },
    {
        name: 'Partenariats',
        emoji: '🤝',
        color: '#00ff88',
        photo: '/images/trombi/page_8.jpg',
        description: 'Le pôle Partenariats négocie avec les entreprises et sponsors pour financer les événements et obtenir des avantages pour les étudiants.',
        members: [
            { name: 'Baptiste Dubreuil', role: 'Partenariats', x: 15, y: 44, w: 18, h: 12 },
            { name: 'Aurelien Malige', role: 'Partenariats', x: 64, y: 40, w: 18, h: 12 },
            { name: 'Salomé Valmorin', role: 'Head Partenariats', x: 44, y: 49, w: 16, h: 10 },
        ]
    },
    {
        name: 'Travel',
        emoji: '✈️',
        color: '#00ccff',
        photo: '/images/trombi/page_9.jpg',
        description: 'Le pôle Travel organise les voyages étudiants, week-ends d\'intégration et escapades. Direction : l\'aventure.',
        members: [
            { name: 'Salomé Nathan', role: 'Head Travel', x: 40, y: 43, w: 18, h: 13 },
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

    return (
        <motion.div
            className="page-trombi"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
        >
            <div className="trombi-header">
                <h1 className="trombi-title">📰 EPSTEIN FILES</h1>
                <p className="trombi-subtitle">LISTE TRIBUT-BOUILLET — CLASSIFIÉ</p>
                <p className="trombi-counter">{revealed.size}/{totalMembers} identités révélées</p>
            </div>

            {allRevealed && (
                <motion.div className="trombi-congrats" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <p style={{ fontSize: '2.5rem' }}>🕵️</p>
                    <h2 style={{ color: '#ffcc00' }}>DOSSIER COMPLET</h2>
                    <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Toutes les identités ont été déclassifiées.</p>
                </motion.div>
            )}

            {POLES.map((pole, pi) => (
                <div key={pi} className="trombi-pole-section">
                    <div className="trombi-pole-header" style={{ borderColor: pole.color }}>
                        <span>{pole.emoji}</span>
                        <span style={{ color: pole.color }}>{pole.name}</span>
                    </div>
                    <div className="trombi-photo-container">
                        <img src={pole.photo} alt={pole.name} className="trombi-group-photo" />
                        {pole.members.map((member, mi) => {
                            const key = memberKey(pi, mi);
                            const isRevealed = revealed.has(key);
                            return (
                                <React.Fragment key={key}>
                                    {!isRevealed ? (
                                        <motion.div
                                            className="trombi-face-rect"
                                            style={{
                                                left: `${member.x}%`,
                                                top: `${member.y}%`,
                                                width: `${member.w}%`,
                                                height: `${member.h}%`,
                                            }}
                                            whileTap={{ scale: 0.92 }}
                                            onClick={(e) => handleTapRect(e, pi, mi)}
                                        />
                                    ) : (
                                        <motion.div
                                            className="trombi-face-label"
                                            style={{
                                                left: `${member.x}%`,
                                                top: `${member.y + member.h}%`,
                                                width: `${Math.max(member.w, 20)}%`,
                                            }}
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <span className="trombi-label-name">{member.name}</span>
                                            <span className="trombi-label-role" style={{ color: pole.color }}>{member.role}</span>
                                        </motion.div>
                                    )}
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
                                {POLES[showInfo.poleIdx].emoji} {POLES[showInfo.poleIdx].name}
                            </div>
                            <p className="trombi-modal-desc">{POLES[showInfo.poleIdx].description}</p>
                            <p className="trombi-modal-role">
                                Rôle : <b style={{ color: POLES[showInfo.poleIdx].color }}>
                                    {POLES[showInfo.poleIdx].members[showInfo.memberIdx].role}
                                </b>
                            </p>
                            <button className="trombi-modal-close" onClick={handleCloseInfo}>
                                DÉCLASSIFIER 🔓
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
                .trombi-face-rect {
                    position: absolute;
                    background: #000;
                    cursor: pointer;
                    border: 2px solid #333;
                    z-index: 2;
                }
                .trombi-face-label {
                    position: absolute;
                    z-index: 2;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    pointer-events: none;
                }
                .trombi-label-name {
                    background: rgba(0,0,0,0.8);
                    color: white;
                    font-weight: 900;
                    font-size: 0.55rem;
                    padding: 2px 5px;
                    border-radius: 3px;
                    white-space: nowrap;
                }
                .trombi-label-role {
                    font-size: 0.45rem;
                    font-weight: bold;
                    background: rgba(0,0,0,0.6);
                    padding: 1px 4px;
                    border-radius: 2px;
                    white-space: nowrap;
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
