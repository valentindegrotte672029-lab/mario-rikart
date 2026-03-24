import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import { Brain, ArrowRight, RotateCcw, Star } from 'lucide-react';
import NeonIcon from './NeonIcon';
import ComingSoon from './ComingSoon';

const HOROSCOPE_SIGNS = [
    {
        id: 'KSK',
        icon: 'dragon-red',
        name: 'KSK',
        text: `Les Samouraïs sont aux commandes, 2e et 3e décan. L'alignement du patio est en harmonie avec le local et représente la façon dont vous maniez le katana. Et comme la navette stellaire sera conjointe au parc et au grisy, il n'est pas sûr que vous soyez très satisfait. Cela dit, comme nous le verrons plus loin, vous serez soutenu par la pc, et comme c'est une de vos planètes maîtresses, elle peut se révéler plus forte que les discours rda, ou en tout cas vous coûter du pain éco plus`
    },
    {
        id: 'PRK',
        icon: 'monkey-green',
        name: 'PRK',
        text: `Il est possible que vous soyez dans une situation délicate sur le plan légal / piscine / administratif / palmier ou que vous imaginez que votre situation va évoluer de manière à ce que le monkey bde (bi di i) reprenne du service. Mais vous êtes de ceux à qui on ne la fait pas, vous êtes méfiants de nature et vous savez très bien que les promesses n'engagent que ceux qui y croient. La nouvelle pyramide lunaire du 27, avant le second tour des élections municipales annonce cependant un renouveau dans vos vies, plein de découvertes et de nouvelles aventures.`
    },
    {
        id: 'RNK',
        icon: 'rhino-purple',
        name: 'RNK',
        text: `Cette année, les astres bodesques sont bien intentionnés à votre égard. D'abord il n'y a pas de dissonance sur le spectre autistique qui gère à la fois vos raouts, votre consommation excessive d'apollo 13 trois fois filtrés, ainsi que vos vomissements intempestifs. Et comme il y a des élections municipales ce mois-ci, vous entendrez beaucoup parler de mélange (on) (mélanchon) (mais qui elle est celle la)| Un avenir plein de ravonnerie et de découvertes en tout genre va s'ouvrir à vous.`
    },
    {
        id: 'DKR',
        icon: 'phoenix-bird',
        name: 'DKR',
        text: `Ce mois-ci, le 27, une éclipse a lieu, c'est le phoenix et l'epsci qui se rencontrent. Pour la première fois? Certainement pas. En cette période l'epsci revit, après tout, c'est pas au vieux singe qu'on apprend à faire la grimace. Votre ambition et votre envie de réussir ne connaissent plus de limite, vous êtes inarrêtables. Cependant vous avez tendance à vous disperser, (2e et 3e décan), tout doucement le matin, inarrêtables le soir... En effet quand le soleil se couche, votre plein potentiel est de sortie (rien à voir avec le ftor). Mais attention, n'oubliez jamais que le sheitan se cache dans les détails et qu'ils se vengeront si vous les négligez. Ne chassez pas vos vieux démons, ce sont des vieux goat mais n'oubliez pas d'accueillir le monde qui s'ouvre à vous à bras ouverts.`
    }
];

const QUESTIONS = [
    { id: 1, text: "Tu préfères :", options: [{ text: "Les araignées bananes", value: "araignees_bananes", icon: "rikart-spider" }, { text: "Le petit Spirou", value: "petit_spirou", icon: "rikart-book" }] },
    { id: 2, text: "T'es plutôt bête ou tuborg :", options: [{ text: "Despé", value: "despe", icon: "rikart-lemon-test" }, { text: "Appi", value: "appi", icon: "rikart-apple" }] },
    { id: 3, text: "L'EPSCI est-il mort ?", options: [{ text: "Oui, c'est l'hécatombe", value: "oui", icon: "rikart-skull" }, { text: "Non, toujours vivant comme dirait Renaud", value: "non", icon: "rikart-guitar" }] },
    { id: 4, text: "Tu préfères :", options: [{ text: "Spot", value: "spot", icon: "rikart-cop" }, { text: "Le dyslexique qui livre des dwichs", value: "dyslexique", icon: "rikart-bike" }] },
    { id: 5, text: "Tu te décris plutôt comme un être social ou un loup solitaire :", options: [{ text: "Je suis le MVP du patio", value: "social", icon: "rikart-crown" }, { text: "Je connais le Learning Lab comme ma poche", value: "loup", icon: "rikart-books" }] },
    { id: 6, text: "Quel moyen de transport utilises-tu le plus :", options: [{ text: "Pédalo", value: "pedalo", icon: "rikart-canoe" }, { text: "Tricycle", value: "tricycle", icon: "rikart-bike" }] },
    { id: 7, text: "Tu préfères :", options: [{ text: "Lécher le couloir des assos", value: "couloir", icon: "rikart-tongue" }, { text: "Le chef cuisto du Massala Bar", value: "massala", icon: "rikart-fire" }] },
    { id: 8, text: "Tu préfères :", options: [{ text: "Ton père", value: "pere", icon: "rikart-man" }, { text: "Ta mère", value: "mere", icon: "rikart-woman" }] },
    { id: 9, text: "T'es plutôt :", options: [{ text: "La PC", value: "pc", icon: "rikart-ambulance" }, { text: "Le discours RDA", value: "rda", icon: "rikart-crown" }] },
    { id: 10, text: "T'es plutôt :", options: [{ text: "Je me lave les mains après le moindre pipi", value: "propre", icon: "rikart-soap-test" }, { text: "J'aime avoir de la matière fécale sous les ongles", value: "sale", icon: "rikart-poop-test" }] }
];

const RESULTS = [
    ['Transpalette', 'Palette'], ['Rien', 'Tout'], ['Sac de plâtre', 'Moule'], ['Mimi Mathy', 'Michael Jordan'],
    ['François Cluzet dans Intouchable', 'Freddi Highmore dans Good Doctor'], ['Adaptateur USB-C', 'Câble HDMI'],
    ['Miaous dans Pokémon', 'Boustiflor'], ['Ecocup cassé', 'Mousse de Tuborg'], ['La PC', 'Le discours RDA'],
    ['Sully crk maria popa 67', 'Le Tage Mage'], ['Pince à linge', 'Séchoir'], ['Ongle incarcéré', 'Corne de pied'],
    ['Un loup très méchant', 'Une brebis sans défense'], ['Le prof de Python', 'Yakoubi'], ['Un paillasson', 'Une chaussure sale']
];

const WS_GRID = [
    ['K','R','O','N','E','M','B','O','U','R','G','F'],
    ['L','X','W','H','I','D','J','Q','Z','T','A','M'],
    ['N','P','G','R','A','V','O','N','Y','B','K','R'],
    ['A','U','W','F','L','P','C','X','H','D','Q','I'],
    ['V','J','B','T','M','G','S','W','Z','F','X','V'],
    ['E','H','D','E','C','O','C','U','P','Y','G','I'],
    ['T','W','K','M','N','F','L','J','Q','A','X','E'],
    ['T','S','Z','H','D','W','G','F','X','B','O','R'],
    ['E','E','J','C','K','L','Q','A','M','R','W','E'],
    ['X','T','U','P','O','P','P','Y','Z','V','H','D'],
    ['G','E','B','N','W','F','K','L','Q','J','M','S'],
    ['H','A','G','O','U','R','D','A','S','S','E','W'],
];
const WS_ROWS = 12;
const WS_COLS = 12;
const WS_WORDS = [
    { word: 'KRONEMBOURG', startR: 0, startC: 0, endR: 0, endC: 10 },
    { word: 'GOURDASSE', startR: 11, startC: 2, endR: 11, endC: 10 },
    { word: 'NAVETTE', startR: 2, startC: 0, endR: 8, endC: 0 },
    { word: 'RIVIERE', startR: 2, startC: 11, endR: 8, endC: 11 },
    { word: 'ECOCUP', startR: 5, startC: 3, endR: 5, endC: 8 },
    { word: 'RAVON', startR: 2, startC: 3, endR: 2, endC: 7 },
    { word: 'POPPY', startR: 9, startC: 3, endR: 9, endC: 7 },
    { word: 'SETE', startR: 7, startC: 1, endR: 10, endC: 1 },
    { word: 'PC', startR: 3, startC: 5, endR: 3, endC: 6 },
    { word: 'BO', startR: 7, startC: 9, endR: 7, endC: 10 },
];
const WS_COLORS = [
    'rgba(255,80,80,0.4)','rgba(80,255,80,0.4)','rgba(80,80,255,0.4)',
    'rgba(255,255,80,0.4)','rgba(255,80,255,0.4)','rgba(80,255,255,0.4)',
    'rgba(255,160,80,0.4)','rgba(160,80,255,0.4)','rgba(80,255,160,0.4)',
    'rgba(255,180,180,0.4)',
];

const BG_ASSET_VERSION = '20260317a';
const PSYCH_VIEW_THEME = {
    test: {
        accent: '#00CED1',
        glow: 'rgba(0, 206, 209, 0.35)',
        bg: `linear-gradient(145deg, rgba(0,206,209,0.24), rgba(0,12,18,0.94)), url('/images/backgrounds/bg_psych_neural_v2.jpg?v=${BG_ASSET_VERSION}')`,
    },
    horoscope: {
        accent: '#4B0082',
        glow: 'rgba(75, 0, 130, 0.35)',
        bg: `linear-gradient(145deg, rgba(75,0,130,0.28), rgba(0,12,18,0.94)), url('/images/backgrounds/bg_psych_neural_v2.jpg?v=${BG_ASSET_VERSION}')`,
    },
    crossword: {
        accent: '#E0FFFF',
        glow: 'rgba(0, 255, 255, 0.30)',
        bg: `linear-gradient(145deg, rgba(224,255,255,0.18), rgba(0,12,18,0.94)), url('/images/backgrounds/bg_psych_neural_v2.jpg?v=${BG_ASSET_VERSION}')`,
    },
};

export default function PsychContent() {
    const [pageView, setPageView] = useState('test'); 
    const [expandedSign, setExpandedSign] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    const [wsStartCell, setWsStartCell] = useState(null);
    const [wsFoundWords, setWsFoundWords] = useState(new Set());
    const viewTheme = PSYCH_VIEW_THEME[pageView] || PSYCH_VIEW_THEME.test;

    const { setBgOverride, clearBgOverride, setPage, featureFlags } = useStore();

    useEffect(() => {
        setBgOverride({ bg: viewTheme.bg, glow: viewTheme.accent, glowSoft: viewTheme.glow });
    }, [viewTheme, setBgOverride]);

    const wsFoundCellColors = useMemo(() => {
        const map = {};
        wsFoundWords.forEach(idx => {
            const w = WS_WORDS[idx];
            const color = WS_COLORS[idx % WS_COLORS.length];
            const dr = Math.sign(w.endR - w.startR);
            const dc = Math.sign(w.endC - w.startC);
            let r = w.startR, c = w.startC;
            for (let i = 0; i < w.word.length; i++) {
                map[`${r}-${c}`] = color;
                r += dr; c += dc;
            }
        });
        return map;
    }, [wsFoundWords]);

    const handleWsCellTap = (r, c) => {
        if (!wsStartCell) {
            setWsStartCell({ r, c });
        } else {
            const matched = WS_WORDS.findIndex((w, i) => {
                if (wsFoundWords.has(i)) return false;
                return (
                    (w.startR === wsStartCell.r && w.startC === wsStartCell.c && w.endR === r && w.endC === c) ||
                    (w.endR === wsStartCell.r && w.endC === wsStartCell.c && w.startR === r && w.startC === c)
                );
            });
            if (matched !== -1) {
                if (window.navigator?.vibrate) window.navigator.vibrate(30);
                setWsFoundWords(prev => new Set([...prev, matched]));
            }
            setWsStartCell(null);
        }
    };

    const wsAllFound = wsFoundWords.size === WS_WORDS.length;

    const handleAnswer = (value) => {
        if (window.navigator?.vibrate) window.navigator.vibrate(20);
        setAnswers({ ...answers, [currentQuestionIndex]: value });

        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 300);
        } else {
            setIsCalculating(true);
            setTimeout(() => {
                const pair = RESULTS[Math.floor(Math.random() * RESULTS.length)];
                setResult(pair[Math.floor(Math.random() * 2)]);
                setIsCalculating(false);
                setIsFinished(true);
            }, 2000);
        }
    };

    const restartTest = () => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setIsFinished(false);
        setIsCalculating(false);
        setResult(null);
    };

    const currentQ = QUESTIONS[currentQuestionIndex];
    const progressValue = ((currentQuestionIndex) / QUESTIONS.length) * 100;

    return (
        <div style={{ padding: '0 10px 40px 10px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="psych-tab-bar" style={{ display: 'flex', gap: '8px', marginBottom: '16px', width: '100%' }}>
                <button className={`psych-tab ${pageView === 'test' ? 'active' : ''}`} onClick={() => setPageView('test')}>
                    <Brain size={18} /> Test
                </button>
                <button className={`psych-tab ${pageView === 'horoscope' ? 'active' : ''}`} onClick={() => setPageView('horoscope')}>
                    <Star size={18} /> Horoscope
                </button>
                <button className={`psych-tab ${pageView === 'crossword' ? 'active' : ''}`} onClick={() => setPageView('crossword')}>
                    Mot Karté
                </button>
            </div>

            <AnimatePresence mode="wait">
                {pageView === 'horoscope' ? (
                    <motion.div key="horoscope" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        {!featureFlags.horoscope ? (
                            <ComingSoon title="Horoscope de Mars" minimal={true} color="#4B0082" />
                        ) : (
                            <div className="horoscope-container">
                                <div className="card-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <Star size={40} color="#ffcc00" style={{ margin: '0 auto 10px' }} />
                                    <h1 className="title-mobile" style={{ color: 'white' }}>Horoscope de Mars</h1>
                                </div>
                                <div className="signs-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {HOROSCOPE_SIGNS.map(sign => (
                                        <motion.div key={sign.id} className={`sign-card ${expandedSign === sign.id ? 'expanded' : ''}`} onClick={() => setExpandedSign(expandedSign === sign.id ? null : sign.id)} layout>
                                            <div className="sign-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <NeonIcon name={sign.icon} size={24} />
                                                <span className="sign-name" style={{ flex: 1, fontWeight: '900', color: '#ffcc00' }}>{sign.name}</span>
                                                <span style={{ color: '#ffcc00', opacity: 0.6 }}>{expandedSign === sign.id ? '▲' : '▼'}</span>
                                            </div>
                                            <AnimatePresence>
                                                {expandedSign === sign.id && (
                                                    <motion.p className="sign-text" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ color: 'white', fontSize: '0.9rem', marginTop: '10px', lineHeight: '1.5' }}>
                                                        {sign.text}
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : pageView === 'crossword' ? (
                    <motion.div key="crossword" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        {!featureFlags.warioCrossword ? (
                            <ComingSoon title="Mot Karté" minimal={true} color="#ff4444" />
                        ) : (
                            <div className="horoscope-container">
                                <h1 className="title-mobile" style={{ textAlign: 'center', marginBottom: '15px' }}>Mot Karté</h1>
                                <div className="cw-scam-banner" style={{ textAlign: 'center', marginBottom: '15px' }}>
                                    <p className="cw-scam-title" style={{ color: '#ff4400', fontWeight: '900', fontSize: '1.2rem' }}>GAGNEZ 10 000€</p>
                                    <p style={{ color: '#ffcc00', fontSize: '0.8rem' }}>Trouvez tous les mots cachés !</p>
                                </div>
                                {wsAllFound ? (
                                    <div className="cw-scam-result" style={{ textAlign: 'center', padding: '20px' }}>
                                        <h2 style={{ color: '#ff4444' }}>ARNAQUE !</h2>
                                        <p style={{ color: '#ccc' }}>Tu ne gagnes RIEN DU TOUT !</p>
                                        <p style={{ color: '#ffcc00', fontWeight: 'bold', marginTop: '10px' }}>WAH HAH HAH !</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="ws-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${WS_COLS}, 1fr)`, gap: '2px', background: '#1a1a2e', padding: '3px', borderRadius: '8px' }}>
                                            {WS_GRID.map((row, r) => row.map((letter, c) => (
                                                <div key={`${r}-${c}`} className={`ws-cell ${wsStartCell?.r === r && wsStartCell?.c === c ? 'ws-start' : ''}`} style={{ aspectRatio: '1', background: wsFoundCellColors[`${r}-${c}`] || 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900', fontSize: '12px' }} onClick={() => handleWsCellTap(r, c)}>
                                                    {letter}
                                                </div>
                                            )))}
                                        </div>
                                        <div className="ws-word-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                                            {WS_WORDS.map((w, i) => (
                                                <span key={i} className={`ws-word-tag ${wsFoundWords.has(i) ? 'found' : ''}`} style={{ fontSize: '0.8rem', color: wsFoundWords.has(i) ? '#88ff88' : 'rgba(255,255,255,0.6)', textDecoration: wsFoundWords.has(i) ? 'line-through' : 'none' }}>{w.word}</span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="test" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }}>
                        {!featureFlags.warioTest ? (
                            <ComingSoon title="Bilan Psychologique" minimal={true} color="#00ffff" />
                        ) : (
                            <div className="test-view-content">
                                <div className="card-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <Brain size={40} color="#00ffff" style={{ margin: '0 auto 10px' }} />
                                    <h1 className="title-mobile">Bilan Psychologique</h1>
                                </div>
                                {isCalculating ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><Brain size={48} color="#00ffff" /></motion.div>
                                        <p style={{ color: '#00ffff', marginTop: '15px' }}>Analyse en cours...</p>
                                    </div>
                                ) : isFinished ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <h2 style={{ color: '#00ffff' }}>TEST TERMINÉ !</h2>
                                        <p style={{ color: '#888', fontSize: '0.8rem' }}>Tu es :</p>
                                        <p style={{ color: '#00ffff', fontSize: '1.5rem', fontWeight: '900', margin: '15px 0' }}>{result}</p>
                                        <button className="btn-restart-test" onClick={restartTest} style={{ padding: '12px 20px', borderRadius: '15px', border: '1px solid #00ffff', background: 'rgba(0,255,255,0.1)', color: 'white', fontWeight: 'bold' }}>REFAIRE LE TEST</button>
                                    </div>
                                ) : (
                                    <div className="question-view">
                                        <div className="progress-bar-bg" style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '10px' }}>
                                            <motion.div style={{ height: '100%', background: '#00ffff', width: `${progressValue}%`, boxShadow: '0 0 10px #00ffff' }} />
                                        </div>
                                        <p style={{ textAlign: 'center', color: '#88c', fontSize: '0.75rem', marginBottom: '20px' }}>Question {currentQuestionIndex + 1} / {QUESTIONS.length}</p>
                                        <motion.div key={currentQuestionIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="question-container">
                                            <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>{currentQ.text}</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {currentQ.options.map((opt, idx) => (
                                                    <button key={idx} className="option-btn" onClick={() => handleAnswer(opt.value)} style={{ padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        {opt.text} <NeonIcon name={opt.icon} size={24} />
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
