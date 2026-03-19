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
        id: 'TMK',
        icon: 'lion-gold',
        name: 'TMK',
        text: `Grâce aux navettes stellaires et au grisy chez vos amis Samouraïs, ce mois devrait être vraiment satisfaisant, à la fois pour votre foie et pour vos poumons, mais aussi parce que les « affaires » qui sont en cours avancent en votre faveur. 2e et 3e décan, sur le plan relationnel, hugo et constant font toujours la paire malgré les 10729KM qui les séparent. Vous tomberez sur des gens aimables et qui ne demanderont qu'à vous aider (le vieux privilège). Attention cependant, atlantide rétrograde, vous allez être tentés de détruire massivement un maximum de chose, n'écoutez pas ce for intérieur. (Non, aucune blague sur Levon ne sera faite pour des raisons évidentes).`
    },
    {
        id: 'VRK',
        icon: 'leopard-cyan',
        name: 'VRK',
        text: `Les groudasses traversent les Atlantes, mettant en lumière votre vie intérieure puisque nous avons affaire à votre secteur de prédilection, la destruction de sete et d'event en tout genre, symbole de ravonnerie, ou tout simplement de savoir vivre. Surveillez aussi les substances qui traînent, votre système immunitaire sera moins actif sous cette conjoncture. À partir du 27, le bo sera dans votre signe et on pourra souhaiter un bon anniversaire à votre 1er décan, la consommation excessive de scotch, qui est encore face à des situations compliquées pour les uns, alors que pour d'autres elle est signe d'un gros succès.`
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
    {
        id: 1,
        text: "Tu préfères :",
        options: [
            { text: "Les araignées bananes", value: "araignees_bananes", icon: "rikart-spider" },
            { text: "Le petit Spirou", value: "petit_spirou", icon: "rikart-book" }
        ]
    },
    {
        id: 2,
        text: "T'es plutôt bête ou tuborg :",
        options: [
            { text: "Despé", value: "despe", icon: "rikart-lemon-test" },
            { text: "Appi", value: "appi", icon: "rikart-apple" }
        ]
    },
    {
        id: 3,
        text: "L'EPSCI est-il mort ?",
        options: [
            { text: "Oui, c'est l'hécatombe", value: "oui", icon: "rikart-skull" },
            { text: "Non, toujours vivant comme dirait Renaud", value: "non", icon: "rikart-guitar" }
        ]
    },
    {
        id: 4,
        text: "Tu préfères :",
        options: [
            { text: "Spot", value: "spot", icon: "rikart-cop" },
            { text: "Le dyslexique qui livre des dwichs", value: "dyslexique", icon: "rikart-bike" }
        ]
    },
    {
        id: 5,
        text: "Tu te décris plutôt comme un être social ou un loup solitaire :",
        options: [
            { text: "Je suis le MVP du patio", value: "social", icon: "rikart-crown" },
            { text: "Je connais le Learning Lab comme ma poche", value: "loup", icon: "rikart-books" }
        ]
    },
    {
        id: 6,
        text: "Quel moyen de transport utilises-tu le plus :",
        options: [
            { text: "Pédalo", value: "pedalo", icon: "rikart-canoe" },
            { text: "Tricycle", value: "tricycle", icon: "rikart-bike" }
        ]
    },
    {
        id: 7,
        text: "Tu préfères :",
        options: [
            { text: "Lécher le couloir des assos", value: "couloir", icon: "rikart-tongue" },
            { text: "Le chef cuisto du Massala Bar", value: "massala", icon: "rikart-fire" }
        ]
    },
    {
        id: 8,
        text: "Tu préfères :",
        options: [
            { text: "Ton père", value: "pere", icon: "rikart-man" },
            { text: "Ta mère", value: "mere", icon: "rikart-woman" }
        ]
    },
    {
        id: 9,
        text: "T'es plutôt :",
        options: [
            { text: "La PC", value: "pc", icon: "rikart-ambulance" },
            { text: "Le discours RDA", value: "rda", icon: "rikart-crown" }
        ]
    },
    {
        id: 10,
        text: "T'es plutôt :",
        options: [
            { text: "Je me lave les mains après le moindre pipi", value: "propre", icon: "rikart-soap-test" },
            { text: "J'aime avoir de la matière fécale sous les ongles", value: "sale", icon: "rikart-poop-test" }
        ]
    }
];

const RESULTS = [
    ['Transpalette', 'Palette'],
    ['Rien', 'Tout'],
    ['Sac de plâtre', 'Moule'],
    ['Mimi Mathy', 'Michael Jordan'],
    ['François Cluzet dans Intouchable', 'Freddi Highmore dans Good Doctor'],
    ['Adaptateur USB-C', 'Câble HDMI'],
    ['Miaous dans Pokémon', 'Boustiflor'],
    ['Ecocup cassé', 'Mousse de Tuborg'],
    ['La PC', 'Le discours RDA'],
    ['Sully crk maria popa 67', 'Le Tage Mage'],
    ['Pince à linge', 'Séchoir'],
    ['Ongle incarcéré', 'Corne de pied'],
    ['Un loup très méchant', 'Une brebis sans défense'],
    ['Le prof de Python', 'Yakoubi'],
    ['Un paillasson', 'Une chaussure sale'],
];

// --- MOTS MELES DATA ---
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

export default function PagePsych() {
    const [pageView, setPageView] = useState('test'); // 'test' | 'horoscope' | 'crossword'
    const [expandedSign, setExpandedSign] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    // Mot Karté state
    const [wsStartCell, setWsStartCell] = useState(null);
    const [wsFoundWords, setWsFoundWords] = useState(new Set());
    const viewTheme = PSYCH_VIEW_THEME[pageView] || PSYCH_VIEW_THEME.test;

    const { setBgOverride, clearBgOverride, setPage, spendCoins, featureFlags } = useStore();

    const CategoryTabBar = () => (

        <div className="category-tab-bar">
            <button className="category-tab" onClick={() => setPage('WARIO')}>
                <NeonIcon name="Wario icône" size={18} /> BAR
            </button>
            <button className="category-tab active" onClick={() => setPage('PSYCH')}>
                <NeonIcon name="Test icône" size={18} /> TEST
            </button>
        </div>
    );

    useEffect(() => {
        setBgOverride({ bg: viewTheme.bg, glow: viewTheme.accent, glowSoft: viewTheme.glow });
    }, [viewTheme]);

    useEffect(() => {
        return () => clearBgOverride();
    }, []);

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

        setAnswers({
            ...answers,
            [currentQuestionIndex]: value
        });

        if (currentQuestionIndex < QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentQuestionIndex(prev => prev + 1);
            }, 300);
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
    const progress = ((currentQuestionIndex) / QUESTIONS.length) * 100;

    return (
        <motion.div
            className="page-mobile psych-mobile float-subtle"
            style={{ '--psych-accent': viewTheme.accent, '--psych-glow': viewTheme.glow, '--psych-bg': viewTheme.bg }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            <CategoryTabBar />
            <div className="glass-panel main-psych-card">
                <div className="psych-tab-bar">
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

                <motion.div
                    key="horoscope"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: '100%' }}
                >
                    <div className="horoscope-view-content">
                        <div className="card-header">
                            <Star size={48} color="#ffcc00" />
                            <h1 className="title-mobile" style={{ color: 'white', textShadow: '0 0 15px rgba(255,255,255,0.4)' }}>Horoscope de Mars</h1>
                        </div>
                        <div className="horoscope-container">
                            <p className="horoscope-subtitle">Signes Astro — Mars 2026</p>
                            <div className="signs-list">
                                {HOROSCOPE_SIGNS.map(sign => (
                                    <motion.div
                                        key={sign.id}
                                        className={`sign-card ${expandedSign === sign.id ? 'expanded' : ''}`}
                                        onClick={() => setExpandedSign(expandedSign === sign.id ? null : sign.id)}
                                        layout
                                    >
                                        <div className="sign-header">
                                            <span className="sign-emoji"><NeonIcon name={sign.icon} size={24} /></span>
                                            <span className="sign-name">{sign.name}</span>
                                            <span className="sign-chevron">{expandedSign === sign.id ? '▲' : '▼'}</span>
                                        </div>
                                        <AnimatePresence>
                                            {expandedSign === sign.id && (
                                                <motion.p
                                                    className="sign-text"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {sign.text}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                </motion.div>
            ) : pageView === 'crossword' ? (
                <motion.div
                    key="crossword"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                    style={{ width: '100%' }}
                >
                    <div className="crossword-view-content">
                        {!featureFlags.warioCrossword ? (
                            <ComingSoon title="Mot Karté" icon="devil-neon" color="#ff4444" iconSize={60} />
                        ) : (
                            <>
                                <div className="card-header">
                                    <h1 className="title-mobile">Mot Karté</h1>
                                </div>
                        <div className="horoscope-container">
                            <div className="cw-scam-banner">
                                <p className="cw-scam-title"><NeonIcon name="coins-stack" size={28} /> GAGNEZ 10 000€ <NeonIcon name="coins-stack" size={28} /></p>
                                <p className="cw-scam-sub">Trouvez tous les mots cachés et remportez le jackpot !</p>
                                <p className="cw-scam-author">— Posté par Waluigi <NeonIcon name="devil-neon" size={28} glow="#ff4444" /></p>
                            </div>

                            {wsAllFound ? (
                                <motion.div className="cw-scam-result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <p style={{ fontSize: '3rem', marginBottom: 10 }}><NeonIcon name="devil-neon" size={80} glow="#ff4444" /></p>
                                    <h2 style={{ color: '#ff4444', marginBottom: 10 }}>ARNAQUE !</h2>
                                    <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                        Bravo, tu as tout trouvé... mais tu ne gagnes <b style={{ color: '#ff4444' }}>RIEN DU TOUT</b> !
                                    </p>
                                    <p style={{ color: '#ffcc00', fontWeight: 'bold', marginTop: 12, fontSize: '1.1rem' }}>WAH HAH HAH !</p>
                                    <p style={{ color: '#888', fontSize: '0.8rem', marginTop: 8 }}>— Waluigi</p>
                                </motion.div>
                            ) : (
                                <>
                                    <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', marginBottom: 8 }}>
                                        Tape la 1ère lettre puis la dernière du mot
                                    </p>
                                    <div className="ws-grid" style={{ gridTemplateColumns: `repeat(${WS_COLS}, 1fr)` }}>
                                        {WS_GRID.map((row, r) =>
                                            row.map((letter, c) => {
                                                const foundColor = wsFoundCellColors[`${r}-${c}`];
                                                const isStart = wsStartCell && wsStartCell.r === r && wsStartCell.c === c;
                                                return (
                                                    <div
                                                        key={`${r}-${c}`}
                                                        className={`ws-cell ${isStart ? 'ws-start' : ''}`}
                                                        style={foundColor ? { background: foundColor } : {}}
                                                        onClick={() => handleWsCellTap(r, c)}
                                                    >
                                                        {letter}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div className="ws-word-list">
                                        {WS_WORDS.map((w, i) => (
                                            <span
                                                key={i}
                                                className={`ws-word-tag ${wsFoundWords.has(i) ? 'found' : ''}`}
                                            >
                                                {w.word}
                                            </span>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                            </>
                        )}
                    </div>

                </motion.div>
            ) : (
            <motion.div
                key="test"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25 }}
                style={{ width: '100%' }}
            >
                    <div className="test-view-content">
                        {!featureFlags.warioTest ? (
                            <ComingSoon title="Bilan Psychologique" icon="Test icône" color="#00ffff" />
                        ) : (
                            <>
                                <div className="card-header">
                                    <Brain size={48} color="#00ffff" />
                                    <h1 className="title-mobile">Bilan Psychologique</h1>
                                </div>

                                {isCalculating ? (
                                    <div className="calculating-view">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        >
                                            <Brain size={64} color="#00ffff" />
                                        </motion.div>
                                        <h2 style={{ marginTop: '20px', color: '#00ffff' }}>Analyse en cours...</h2>
                                        <p style={{ color: '#aaa', marginTop: '10px' }}>Sondage des tréfonds de ton âme.</p>
                                    </div>
                                ) : isFinished ? (
                                    <motion.div
                                        className="result-view"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h2 style={{ color: '#00ffff', marginBottom: '15px' }}>TEST TERMINÉ !</h2>
                                        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>Tu es :</p>
                                        <p style={{ color: '#00ffff', fontSize: '1.6rem', fontWeight: '900', marginBottom: '20px', textShadow: '0 0 15px rgba(0,255,255,0.4)' }}>
                                            {result}
                                        </p>
                                        <button className="btn-secondary" onClick={restartTest}>
                                            <RotateCcw size={20} style={{ marginRight: '10px' }} />
                                            Refaire le test
                                        </button>
                                    </motion.div>
                                ) : (
                                    <div className="question-view">
                                        <div className="progress-bar-bg">
                                            <motion.div
                                                className="progress-bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                            ></motion.div>
                                        </div>
                                        <p className="question-counter">Question {currentQuestionIndex + 1} / {QUESTIONS.length}</p>

                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={currentQuestionIndex}
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -50 }}
                                                transition={{ duration: 0.2 }}
                                                className="question-container"
                                            >
                                                <h3 className="question-text">{currentQ.text}</h3>

                                                <div className="options-grid">
                                                    {currentQ.options.map((opt, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="option-btn"
                                                            onClick={() => handleAnswer(opt.value)}
                                                        >
                                                            {opt.text} {opt.icon && <NeonIcon name={opt.icon} size={28} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

            </motion.div>
            )}
            </AnimatePresence>
            </div>

            <style>{`


                .psych-mobile {
                    --theme-color: var(--psych-accent, #00ffff);
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    overflow-y: auto;
                    padding: 15px;
                    background-image: 
                        radial-gradient(circle at center, var(--psych-glow, rgba(0,206,209,0.35)) 0%, transparent 58%),
                        linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)),
                        var(--psych-bg);
                    background-position: center;
                    background-size: cover;
                    background-repeat: no-repeat;
                    background-attachment: fixed;
                    border-radius: 24px;
                    transition: background 0.5s ease-in-out;
                }

                .psych-mobile > * {
                    position: relative;
                    z-index: 1;
                }

                .main-psych-card {
                    width: 100%;
                    padding: 20px 15px;
                    border-radius: 32px;
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    background: rgba(0, 10, 12, 0.88);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    display: flex;
                    flex-direction: column;
                    height: auto;
                    min-height: fit-content;
                    margin-bottom: 20px;
                    flex-shrink: 0; /* Prevents shrinking on mobile containers */
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 25px;
                    flex-shrink: 0;
                }

                .title-mobile {
                    color: var(--theme-color);
                    font-size: 1.5rem;
                    font-weight: 900;
                    margin-top: 10px;
                    text-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
                }

                .progress-bar-bg {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 10px;
                    flex-shrink: 0;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: var(--theme-color);
                    box-shadow: 0 0 10px var(--theme-color);
                }

                .question-counter {
                    text-align: center;
                    color: #88c;
                    font-size: 0.8rem;
                    font-weight: bold;
                    margin-bottom: 25px;
                    flex-shrink: 0;
                }

                .question-text {
                    font-size: 1.15rem;
                    color: white;
                    text-align: center;
                    margin-bottom: 25px;
                    line-height: 1.4;
                    min-height: 50px;
                    flex-shrink: 0;
                }

                .options-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    flex: 1; /* Allow grid to push card height */
                }

                .option-btn {
                    padding: 15px 12px;
                    background: rgba(255, 255, 255, 0.03) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 16px !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
                    color: white;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                    line-height: 1.2;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }

                .option-btn .neon-icon {
                   filter: drop-shadow(0 0 12px rgba(255,255,255,0.4)) !important;
                }
                .option-btn img {
                   mix-blend-mode: normal !important; /* Revenir en normal pour éviter le détourage dégueu du screen sur les stickers */
                }

                .option-btn:active {
                    transform: scale(0.97);
                    background: rgba(255, 255, 255, 0.1);
                    border-color: var(--theme-color);
                }

                .calculating-view, .result-view {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                /* Tab Bar */
                .psych-tab-bar {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                    width: 100%;
                }
                .psych-tab {
                    flex: 1;
                    padding: 10px 0;
                    border: none !important;
                    border-bottom: 2px solid rgba(0, 255, 255, 0.2) !important;
                    border-radius: 0;
                    background: transparent !important;
                    color: #888;
                    font-size: 0.95rem;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                .psych-tab.active {
                    background: transparent !important;
                    border-bottom-color: #00ffff !important;
                    color: #00ffff;
                    box-shadow: none !important;
                    text-shadow: 0 0 10px rgba(0,255,255,0.8);
                }

                .category-tab-bar {
                  display: flex;
                  width: 100%;
                  max-width: 450px;
                  gap: 10px;
                  margin-bottom: 15px;
                  padding: 0 5px;
                  z-index: 1000;
                }
                .category-tab {
                  flex: 1;
                  background: rgba(255, 255, 255, 0.05) !important;
                  border: 1px solid rgba(255, 255, 255, 0.1) !important;
                  border-radius: 15px;
                  padding: 12px;
                  color: #aaa;
                  font-weight: 800;
                  font-size: 0.8rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  transition: all 0.2s;
                }
                .category-tab.active {
                  background: rgba(0, 206, 209, 0.2) !important;
                  border-color: #00ced1 !important;
                  color: white;
                  box-shadow: 0 0 15px rgba(0, 206, 209, 0.3);
                }

                /* Horoscope */
                .horoscope-container {
                    width: 100%;
                    overflow-y: auto;
                    padding-bottom: 30px;
                }
                .horoscope-title {
                    text-align: center;
                    color: #ffcc00;
                    font-size: 1.6rem;
                    font-weight: 900;
                    margin-bottom: 4px;
                    text-shadow: 0 0 15px rgba(255, 204, 0, 0.4);
                }
                .horoscope-subtitle {
                    text-align: center;
                    color: #888;
                    font-size: 0.85rem;
                    margin-bottom: 20px;
                }
                .signs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .sign-card {
                    background: transparent !important;
                    border: none !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    padding: 14px 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .sign-card.expanded {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }
                .sign-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .sign-emoji {
                    font-size: 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .sign-name {
                    font-size: 1.2rem;
                    font-weight: 900;
                    color: #ffcc00;
                    flex: 1;
                    letter-spacing: 1px;
                }
                .sign-chevron {
                    color: #ffcc00;
                    font-size: 0.8rem;
                    opacity: 0.6;
                }
                .sign-text {
                    color: white;
                    font-size: 0.92rem;
                    line-height: 1.6;
                    margin-top: 12px;
                    overflow: hidden;
                }

                /* Mot Karté */
                .cw-scam-banner {
                    text-align: center;
                    background: transparent !important;
                    border: none !important;
                    padding: 16px 12px;
                    margin-bottom: 16px;
                }
                .cw-scam-title {
                    color: #ff4400;
                    font-size: 1.4rem;
                    font-weight: 900;
                    text-shadow: 0 0 10px rgba(255,68,0,0.4);
                    animation: cwBlink 1s infinite alternate;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                @keyframes cwBlink {
                    from { opacity: 1; }
                    to { opacity: 0.6; }
                }
                .cw-scam-sub {
                    color: #ffcc00;
                    font-size: 0.85rem;
                    margin-top: 4px;
                }
                .cw-scam-author {
                    color: #888;
                    font-size: 0.75rem;
                    margin-top: 6px;
                    font-style: italic;
                }
                .cw-scam-result {
                    text-align: center;
                    padding: 40px 20px;
                    background: transparent !important;
                    border: none !important;
                    border-radius: 0;
                }
                .ws-grid {
                    display: grid;
                    gap: 2px;
                    margin: 0 auto 14px;
                    max-width: 360px;
                    background: #1a1a2e;
                    padding: 3px;
                    border-radius: 8px;
                    border: 2px solid rgba(255,255,255,0.1);
                }
                .ws-cell {
                    aspect-ratio: 1;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 900;
                    color: white;
                    cursor: pointer;
                    transition: all 0.15s;
                    user-select: none;
                    -webkit-user-select: none;
                }
                .ws-cell:active {
                    transform: scale(0.9);
                }
                .ws-cell.ws-start {
                    background: rgba(0,255,255,0.25);
                    border-color: #00ffff;
                    box-shadow: 0 0 8px rgba(0,255,255,0.5);
                }
                .ws-word-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    justify-content: center;
                    margin-top: 12px;
                    padding-bottom: 20px;
                }
                .ws-word-tag {
                    padding: 6px 12px;
                    border-radius: 0;
                    background: transparent !important;
                    border: none !important;
                    color: rgba(255,255,255,0.6);
                    font-size: 0.82rem;
                    font-weight: bold;
                    transition: all 0.3s;
                }
                .ws-word-tag.found {
                    text-decoration: line-through;
                    opacity: 0.8;
                    background: transparent !important;
                    border-color: transparent !important;
                    color: #88ff88;
                    text-shadow: 0 0 10px #88ff88;
                }
            `}</style>
        </motion.div>
    );
}
