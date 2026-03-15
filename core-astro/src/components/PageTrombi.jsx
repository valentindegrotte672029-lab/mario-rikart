import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POLES = [
    {
        name: 'Présidence',
        emoji: '👑',
        color: '#ffcc00',
        description: 'Le pôle Présidence dirige le BDE, coordonne tous les autres pôles et représente les étudiants auprès de l\'administration. Ils sont les capitaines du navire.',
        members: [
            { name: 'Lucas Tribut', role: 'Président', photo: '/images/trombi/faces/lucas_tribut.jpg' },
            { name: 'Bouillet', role: 'Vice-Présidente', photo: '/images/trombi/faces/bouillet.jpg' },
        ]
    },
    {
        name: 'Secrétariat',
        emoji: '📋',
        color: '#00ccff',
        description: 'Le pôle Secrétariat gère toute la paperasse, les comptes-rendus, la communication interne et les procès-verbaux. Sans eux, c\'est le chaos administratif.',
        members: [
            { name: 'Inès Ennadif', role: 'Secrétaire', photo: '/images/trombi/faces/ines_ennadif.jpg' },
            { name: 'Thomas Dubuc', role: 'Head Secrétaire', photo: '/images/trombi/faces/thomas_dubuc.jpg' },
        ]
    },
    {
        name: 'Trésorerie',
        emoji: '💰',
        color: '#39ff14',
        description: 'Le pôle Trésorerie gère le budget du BDE, les encaissements, les dépenses et s\'assure que les comptes sont en ordre. Les gardiens du coffre-fort.',
        members: [
            { name: 'Matéo Cavaloc', role: 'Trésorier', photo: '/images/trombi/faces/mateo_cavaloc.jpg' },
            { name: 'Kylian Libouban', role: 'Head Trésorier', photo: '/images/trombi/faces/kylian_libouban.jpg' },
        ]
    },
    {
        name: 'Ambassade',
        emoji: '🌍',
        color: '#ff66b2',
        description: 'Le pôle Ambassade représente le BDE à l\'extérieur, gère les relations avec les autres écoles et associations. Ce sont les ambassadeurs de l\'EPSCI.',
        members: [
            { name: 'Alexandre Hoffherr', role: 'Ambassadeur', photo: '/images/trombi/faces/alexandre_hoffherr.jpg' },
            { name: 'Gomes', role: 'Head Ambassadeur', photo: '/images/trombi/faces/gomes.jpg' },
        ]
    },
    {
        name: 'Communication',
        emoji: '📢',
        color: '#ff4400',
        description: 'Le pôle Communication gère les réseaux sociaux, les affiches, les vidéos et toute la visibilité du BDE. Ils font le buzz.',
        members: [
            { name: 'Valentin Degrotte', role: 'Communication', photo: '/images/trombi/faces/valentin_degrotte.jpg' },
            { name: 'Maxime Blood', role: 'Head Communication', photo: '/images/trombi/faces/maxime_blood.jpg' },
        ]
    },
    {
        name: 'Événementiel',
        emoji: '🎉',
        color: '#ff00ff',
        description: 'Le pôle Événementiel organise toutes les soirées, galas, afterworks et événements de la vie étudiante. Les rois de la fête.',
        members: [
            { name: 'Callels', role: 'Événementiel', photo: '/images/trombi/faces/callels.jpg' },
            { name: 'Lemoine', role: 'Head Événementiel', photo: '/images/trombi/faces/lemoine.jpg' },
        ]
    },
    {
        name: 'Animations',
        emoji: '🎮',
        color: '#9933ff',
        description: 'Le pôle Animations organise les activités ludiques, tournois, jeux et animations pendant les temps de pause. Fun garantie.',
        members: [
            { name: 'Édouard Souied', role: 'Animations', photo: '/images/trombi/faces/edouard_souied.jpg' },
            { name: 'Radek Roussel', role: 'Animations', photo: '/images/trombi/faces/radek_roussel.jpg' },
            { name: 'Alyxane Lefèvre-Böhm', role: 'Head Animations', photo: '/images/trombi/faces/alyxane_lefevre.jpg' },
        ]
    },
    {
        name: 'Partenariats',
        emoji: '🤝',
        color: '#00ff88',
        description: 'Le pôle Partenariats négocie avec les entreprises et sponsors pour financer les événements et obtenir des avantages pour les étudiants.',
        members: [
            { name: 'Baptiste Dubreuil', role: 'Partenariats', photo: '/images/trombi/faces/baptiste_dubreuil.jpg' },
            { name: 'Aurélien Malige', role: 'Partenariats', photo: '/images/trombi/faces/aurelien_malige.jpg' },
            { name: 'Salomé Valmorin', role: 'Partenariats', photo: '/images/trombi/faces/salome_valmorin.jpg' },
        ]
    },
    {
        name: 'Travel',
        emoji: '✈️',
        color: '#00ccff',
        description: 'Le pôle Travel organise les voyages étudiants, week-ends d\'intégration et escapades. Direction : l\'aventure.',
        members: [
            { name: 'Salomé Nathan', role: 'Head Travel', photo: '/images/trombi/faces/salome_nathan.jpg' },
        ]
    },
];

export default function PageTrombi() {
    const [revealed, setRevealed] = useState(new Set());
    const [showInfo, setShowInfo] = useState(null); // { poleIdx, memberIdx }

    const memberKey = (pi, mi) => `${pi}-${mi}`;
    const totalMembers = POLES.reduce((acc, p) => acc + p.members.length, 0);
    const allRevealed = revealed.size === totalMembers;

    const handleTapBlack = (poleIdx, memberIdx) => {
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
                    <div className="trombi-members-grid">
                        {pole.members.map((member, mi) => {
                            const key = memberKey(pi, mi);
                            const isRevealed = revealed.has(key);
                            return (
                                <motion.div
                                    key={key}
                                    className="trombi-card"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => !isRevealed && handleTapBlack(pi, mi)}
                                >
                                    <div className="trombi-photo-area">
                                        {isRevealed ? (
                                            <motion.img
                                                src={member.photo}
                                                alt={member.name}
                                                className="trombi-photo"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        ) : (
                                            <div className="trombi-black-rect">
                                                <span className="trombi-classified">CLASSIFIÉ</span>
                                                <span className="trombi-tap-hint">APPUYER</span>
                                            </div>
                                        )}
                                    </div>
                                    {isRevealed && (
                                        <motion.div 
                                            className="trombi-name-area"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <p className="trombi-member-name">{member.name}</p>
                                            <p className="trombi-member-role" style={{ color: pole.color }}>{member.role}</p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Info Modal */}
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
                    margin-bottom: 4px;
                }
                .trombi-pole-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-left: 4px solid;
                    font-weight: 900;
                    font-size: 1.1rem;
                    margin-bottom: 10px;
                }
                .trombi-members-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                }
                .trombi-card {
                    background: rgba(0,0,0,0.5);
                    border: 2px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    user-select: none;
                    -webkit-user-select: none;
                }
                .trombi-photo-area {
                    width: 100%;
                    aspect-ratio: 3/4;
                    position: relative;
                    overflow: hidden;
                }
                .trombi-photo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .trombi-black-rect {
                    width: 100%;
                    height: 100%;
                    background: #000;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    border: 3px solid #333;
                }
                .trombi-classified {
                    color: #ff3333;
                    font-weight: 900;
                    font-size: 0.85rem;
                    letter-spacing: 4px;
                    text-shadow: 0 0 6px rgba(255,50,50,0.5);
                    animation: trombiBlink 1.5s infinite alternate;
                }
                @keyframes trombiBlink {
                    from { opacity: 1; }
                    to { opacity: 0.4; }
                }
                .trombi-tap-hint {
                    color: #555;
                    font-size: 0.65rem;
                    letter-spacing: 2px;
                }
                .trombi-name-area {
                    padding: 8px;
                    text-align: center;
                }
                .trombi-member-name {
                    color: white;
                    font-weight: 900;
                    font-size: 0.85rem;
                    margin: 0;
                }
                .trombi-member-role {
                    font-size: 0.7rem;
                    font-weight: bold;
                    margin: 2px 0 0;
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
