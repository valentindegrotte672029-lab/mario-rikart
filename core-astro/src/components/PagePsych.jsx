import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, RotateCcw, Star } from 'lucide-react';

const HOROSCOPE_SIGNS = [
    {
        id: 'KSK',
        emoji: '🐉',
        name: 'KSK',
        text: `Les Samouraïs sont aux commandes, 2e et 3e décan. L'alignement du patio est en harmonie avec le local et représente la façon dont vous maniez le katana. Et comme la navette stellaire sera conjointe au parc et au grisy, il n'est pas sûr que vous soyez très satisfait. Cela dit, comme nous le verrons plus loin, vous serez soutenu par la pc, et comme c'est une de vos planètes maîtresses, elle peut se révéler plus forte que les discours rda, ou en tout cas vous coûter du pain éco plus`
    },
    {
        id: 'TMK',
        emoji: '🦁',
        name: 'TMK',
        text: `Grâce aux navettes stellaires et au grisy chez vos amis Samouraïs, ce mois devrait être vraiment satisfaisant, à la fois pour votre foie et pour vos poumons, mais aussi parce que les « affaires » qui sont en cours avancent en votre faveur. 2e et 3e décan, sur le plan relationnel, hugo et constant font toujours la paire malgré les 10729KM qui les séparent. Vous tomberez sur des gens aimables et qui ne demanderont qu'à vous aider (le vieux privilège). Attention cependant, atlantide rétrograde, vous allez être tentés de détruire massivement un maximum de chose, n'écoutez pas ce for intérieur. (Non, aucune blague sur Levon ne sera faite pour des raisons évidentes).`
    },
    {
        id: 'VRK',
        emoji: '🐆',
        name: 'VRK',
        text: `Les groudasses traversent les Atlantes, mettant en lumière votre vie intérieure puisque nous avons affaire à votre secteur de prédilection, la destruction de sete et d'event en tout genre, symbole de ravonnerie, ou tout simplement de savoir vivre. Surveillez aussi les substances qui traînent, votre système immunitaire sera moins actif sous cette conjoncture. À partir du 27, le bo sera dans votre signe et on pourra souhaiter un bon anniversaire à votre 1er décan, la consommation excessive de scotch, qui est encore face à des situations compliquées pour les uns, alors que pour d'autres elle est signe d'un gros succès.`
    },
    {
        id: 'PRK',
        emoji: '�',
        name: 'PRK',
        text: `Il est possible que vous soyez dans une situation délicate sur le plan légal / piscine / administratif / palmier ou que vous imaginez que votre situation va évoluer de manière à ce que le monkey bde (bi di i) reprenne du service. Mais vous êtes de ceux à qui on ne la fait pas, vous êtes méfiants de nature et vous savez très bien que les promesses n'engagent que ceux qui y croient. La nouvelle pyramide lunaire du 27, avant le second tour des élections municipales annonce cependant un renouveau dans vos vies, plein de découvertes et de nouvelles aventures.`
    },
    {
        id: 'RNK',
        emoji: '🦏',
        name: 'RNK',
        text: `Cette année, les astres bodesques sont bien intentionnés à votre égard. D'abord il n'y a pas de dissonance sur le spectre autistique qui gère à la fois vos raouts, votre consommation excessive d'apollo 13 trois fois filtrés, ainsi que vos vomissements intempestifs. Et comme il y a des élections municipales ce mois-ci, vous entendrez beaucoup parler de mélange (on) (mélanchon) (mais qui elle est celle la)| Un avenir plein de ravonnerie et de découvertes en tout genre va s'ouvrir à vous.`
    },
    {
        id: 'DKR',
        emoji: '�‍�🔥',
        name: 'DKR',
        text: `Ce mois-ci, le 27, une éclipse a lieu, c'est le phoenix et l'epsci qui se rencontrent. Pour la première fois? Certainement pas. En cette période l'epsci revit, après tout, c'est pas au vieux singe qu'on apprend à faire la grimace. Votre ambition et votre envie de réussir ne connaissent plus de limite, vous êtes inarrêtables. Cependant vous avez tendance à vous disperser, (2e et 3e décan), tout doucement le matin, inarrêtables le soir... En effet quand le soleil se couche, votre plein potentiel est de sortie (rien à voir avec le ftor). Mais attention, n'oubliez jamais que le sheitan se cache dans les détails et qu'ils se vengeront si vous les négligez. Ne chassez pas vos vieux démons, ce sont des vieux goat mais n'oubliez pas d'accueillir le monde qui s'ouvre à vous à bras ouverts.`
    }
];

const QUESTIONS = [
    {
        id: 1,
        text: "Tu préfères :",
        options: [
            { text: "Les araignées bananes 🕷️🍌", value: "araignees_bananes" },
            { text: "Le petit Spirou 📖", value: "petit_spirou" }
        ]
    },
    {
        id: 2,
        text: "T'es plutôt bête ou tuborg :",
        options: [
            { text: "Despé 🍋", value: "despe" },
            { text: "Appi 🍏", value: "appi" }
        ]
    },
    {
        id: 3,
        text: "L'EPSCI est-il mort ?",
        options: [
            { text: "Oui, c'est l'hécatombe ☠️", value: "oui" },
            { text: "Non, toujours vivant comme dirait Renaud 🎸", value: "non" }
        ]
    },
    {
        id: 4,
        text: "Tu préfères :",
        options: [
            { text: "Spot 👮‍♂️", value: "spot" },
            { text: "Le dyslexique qui livre des dwichs 🚲", value: "dyslexique" }
        ]
    },
    {
        id: 5,
        text: "Tu te décris plutôt comme un être social ou un loup solitaire :",
        options: [
            { text: "Je suis le MVP du patio 👑", value: "social" },
            { text: "Je connais le Learning Lab comme ma poche 📚", value: "loup" }
        ]
    },
    {
        id: 6,
        text: "Quel moyen de transport utilises-tu le plus :",
        options: [
            { text: "Pédalo 🛶", value: "pedalo" },
            { text: "Tricycle 🚲", value: "tricycle" }
        ]
    },
    {
        id: 7,
        text: "Tu préfères :",
        options: [
            { text: "Lécher le couloir des assos 👅", value: "couloir" },
            { text: "Le chef cuisto du Massala Bar 🇮🇳", value: "massala" }
        ]
    },
    {
        id: 8,
        text: "Tu préfères :",
        options: [
            { text: "Ton père 👨", value: "pere" },
            { text: "Ta mère 👩", value: "mere" }
        ]
    },
    {
        id: 9,
        text: "T'es plutôt :",
        options: [
            { text: "La PC 🚑", value: "pc" },
            { text: "Le discours RDA 👑", value: "rda" }
        ]
    },
    {
        id: 10,
        text: "T'es plutôt :",
        options: [
            { text: "Je me lave les mains après le moindre pipi 🧼", value: "propre" },
            { text: "J'aime avoir de la matière fécale sous les ongles 💩", value: "sale" }
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

// --- MOTS FLECHES DATA ---
// Compact grid: 12 cols × 7 rows
// All cells are either: clue (definition+arrow), letter, or blocked (dark)
const MF_WORDS = [
    { word: 'RAVON', clue: 'Sport nocturne', dir: 'right', startR: 0, startC: 1, clueR: 0, clueC: 0 },
    { word: 'SETE', clue: 'Ville du sud', dir: 'right', startR: 0, startC: 8, clueR: 0, clueC: 7 },
    { word: 'POPPY', clue: 'Fleur anglaise', dir: 'right', startR: 1, startC: 1, clueR: 1, clueC: 0 },
    { word: 'BO', clue: 'Quel style', dir: 'right', startR: 1, startC: 7, clueR: 1, clueC: 6 },
    { word: 'PC', clue: 'Secours', dir: 'right', startR: 1, startC: 10, clueR: 1, clueC: 9 },
    { word: 'KRONEMBOURG', clue: 'Bière', dir: 'right', startR: 2, startC: 1, clueR: 2, clueC: 0 },
    { word: 'ECOCUP', clue: 'Gobelet soirée', dir: 'right', startR: 3, startC: 1, clueR: 3, clueC: 0 },
    { word: 'NAVETTE', clue: 'Transport', dir: 'right', startR: 4, startC: 1, clueR: 4, clueC: 0 },
    { word: 'RIVIERE', clue: "Cours d'eau", dir: 'right', startR: 5, startC: 1, clueR: 5, clueC: 0 },
    { word: 'GOURDASSE', clue: 'Récipient XXL', dir: 'right', startR: 6, startC: 1, clueR: 6, clueC: 0 },
];
const MF_COLS = 12;
const MF_ROWS = 7;

function buildMFGrid() {
    const grid = Array.from({ length: MF_ROWS }, () =>
        Array.from({ length: MF_COLS }, () => ({ type: 'blocked' }))
    );
    MF_WORDS.forEach(w => {
        grid[w.clueR][w.clueC] = { type: 'clue', text: w.clue, dir: w.dir };
        for (let i = 0; i < w.word.length; i++) {
            const r = w.dir === 'down' ? w.startR + i : w.startR;
            const c = w.dir === 'right' ? w.startC + i : w.startC;
            if (!grid[r][c] || grid[r][c].type !== 'letter') {
                grid[r][c] = { type: 'letter', letter: w.word[i] };
            }
        }
    });
    return grid;
}
const MF_GRID = buildMFGrid();

export default function PagePsych() {
    const [pageView, setPageView] = useState('test'); // 'test' | 'horoscope' | 'crossword'
    const [expandedSign, setExpandedSign] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState(null);

    // Mots fléchés state
    const [mfInput, setMfInput] = useState(() =>
        Array.from({ length: MF_ROWS }, () => Array.from({ length: MF_COLS }, () => ''))
    );
    const [mfSelected, setMfSelected] = useState(null);
    const [mfDir, setMfDir] = useState('right');
    const [mfChecked, setMfChecked] = useState(false);
    const [mfSolved, setMfSolved] = useState(false);

    const mfHighlightedCells = useMemo(() => {
        if (!mfSelected) return new Set();
        const { row, col } = mfSelected;
        const cells = new Set();
        const tryDir = (d) => {
            for (const w of MF_WORDS) {
                if (w.dir !== d) continue;
                for (let i = 0; i < w.word.length; i++) {
                    const wr = w.dir === 'down' ? w.startR + i : w.startR;
                    const wc = w.dir === 'right' ? w.startC + i : w.startC;
                    if (wr === row && wc === col) {
                        for (let j = 0; j < w.word.length; j++) {
                            const hr = w.dir === 'down' ? w.startR + j : w.startR;
                            const hc = w.dir === 'right' ? w.startC + j : w.startC;
                            cells.add(`${hr}-${hc}`);
                        }
                        return true;
                    }
                }
            }
            return false;
        };
        if (!tryDir(mfDir)) tryDir(mfDir === 'right' ? 'down' : 'right');
        return cells;
    }, [mfSelected, mfDir]);

    const handleMfCellClick = (row, col) => {
        const cell = MF_GRID[row][col];
        if (!cell || cell.type !== 'letter') return;
        if (mfSelected && mfSelected.row === row && mfSelected.col === col) {
            setMfDir(d => d === 'right' ? 'down' : 'right');
        } else {
            setMfSelected({ row, col });
        }
        setMfChecked(false);
    };

    const handleMfLetter = (letter) => {
        if (!mfSelected) return;
        const { row, col } = mfSelected;
        const newInput = mfInput.map(r => [...r]);
        newInput[row][col] = letter;
        setMfInput(newInput);
        setMfChecked(false);
        const nr = mfDir === 'down' ? row + 1 : row;
        const nc = mfDir === 'right' ? col + 1 : col;
        if (nr < MF_ROWS && nc < MF_COLS && MF_GRID[nr]?.[nc]?.type === 'letter') {
            setMfSelected({ row: nr, col: nc });
        }
    };

    const handleMfDelete = () => {
        if (!mfSelected) return;
        const { row, col } = mfSelected;
        const newInput = mfInput.map(r => [...r]);
        if (newInput[row][col]) {
            newInput[row][col] = '';
        } else {
            const pr = mfDir === 'down' ? row - 1 : row;
            const pc = mfDir === 'right' ? col - 1 : col;
            if (pr >= 0 && pc >= 0 && MF_GRID[pr]?.[pc]?.type === 'letter') {
                newInput[pr][pc] = '';
                setMfSelected({ row: pr, col: pc });
            }
        }
        setMfInput(newInput);
        setMfChecked(false);
    };

    const handleMfCheck = () => {
        setMfChecked(true);
        let allCorrect = true;
        for (let r = 0; r < MF_ROWS; r++) {
            for (let c = 0; c < MF_COLS; c++) {
                const cell = MF_GRID[r][c];
                if (cell && cell.type === 'letter' && mfInput[r][c] !== cell.letter) {
                    allCorrect = false;
                }
            }
        }
        setMfSolved(allCorrect);
    };

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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
        >
            {/* Tab Switcher */}
            <div className="psych-tab-bar">
                <button className={`psych-tab ${pageView === 'test' ? 'active' : ''}`} onClick={() => setPageView('test')}>
                    <Brain size={18} /> Test
                </button>
                <button className={`psych-tab ${pageView === 'horoscope' ? 'active' : ''}`} onClick={() => setPageView('horoscope')}>
                    <Star size={18} /> Horoscope
                </button>
                <button className={`psych-tab ${pageView === 'crossword' ? 'active' : ''}`} onClick={() => setPageView('crossword')}>
                    💰 Mots Fléchés
                </button>
            </div>

            <AnimatePresence mode="wait">
            {pageView === 'horoscope' ? (
                <motion.div
                    key="horoscope"
                    className="horoscope-container"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                >
                    <h1 className="horoscope-title">🔮 Horoscope de Mars</h1>
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
                                    <span className="sign-emoji">{sign.emoji}</span>
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
                </motion.div>
            ) : pageView === 'crossword' ? (
                <motion.div
                    key="crossword"
                    className="horoscope-container"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.25 }}
                >
                    <div className="cw-scam-banner">
                        <p className="cw-scam-title">💰 GAGNEZ 10 000€ 💰</p>
                        <p className="cw-scam-sub">Résolvez ces mots fléchés EPSCI et remportez le jackpot !</p>
                        <p className="cw-scam-author">— Posté par Waluigi 😈</p>
                    </div>

                    {mfSolved ? (
                        <motion.div className="cw-scam-result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <p style={{ fontSize: '3rem', marginBottom: 10 }}>😈</p>
                            <h2 style={{ color: '#ff4444', marginBottom: 10 }}>ARNAQUE !</h2>
                            <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: 1.5 }}>
                                Bravo, tu as tout trouvé... mais tu ne gagnes <b style={{ color: '#ff4444' }}>RIEN DU TOUT</b> !
                            </p>
                            <p style={{ color: '#ffcc00', fontWeight: 'bold', marginTop: 12, fontSize: '1.1rem' }}>WAH HAH HAH !</p>
                            <p style={{ color: '#888', fontSize: '0.8rem', marginTop: 8 }}>— Waluigi</p>
                        </motion.div>
                    ) : (
                        <>
                            <div className="mf-grid" style={{ gridTemplateColumns: `repeat(${MF_COLS}, 1fr)` }}>
                                {Array.from({ length: MF_ROWS }).map((_, r) =>
                                    Array.from({ length: MF_COLS }).map((_, c) => {
                                        const cell = MF_GRID[r][c];
                                        if (cell.type === 'blocked') return <div key={`${r}-${c}`} className="mf-cell-blocked" />;
                                        if (cell.type === 'clue') {
                                            return (
                                                <div key={`${r}-${c}`} className="mf-cell-clue">
                                                    <span className="mf-clue-text">{cell.text}</span>
                                                    <span className="mf-clue-arrow">→</span>
                                                </div>
                                            );
                                        }
                                        const isSelected = mfSelected && mfSelected.row === r && mfSelected.col === c;
                                        const isHighlighted = mfHighlightedCells.has(`${r}-${c}`);
                                        const isCorrect = mfChecked && mfInput[r][c] === cell.letter;
                                        const isWrong = mfChecked && mfInput[r][c] && mfInput[r][c] !== cell.letter;
                                        return (
                                            <div
                                                key={`${r}-${c}`}
                                                className={`cw-cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                                                onClick={() => handleMfCellClick(r, c)}
                                            >
                                                <span className="cw-cell-letter">{mfInput[r][c]}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div className="cw-keyboard">
                                {'AZERTYUIOP'.split('').map(l => (
                                    <button key={l} className="cw-key" onClick={() => handleMfLetter(l)}>{l}</button>
                                ))}
                                {'QSDFGHJKLM'.split('').map(l => (
                                    <button key={l} className="cw-key" onClick={() => handleMfLetter(l)}>{l}</button>
                                ))}
                                <div className="cw-key-row-bottom">
                                    {'WXCVBN'.split('').map(l => (
                                        <button key={l} className="cw-key" onClick={() => handleMfLetter(l)}>{l}</button>
                                    ))}
                                    <button className="cw-key cw-key-del" onClick={handleMfDelete}>⌫</button>
                                </div>
                            </div>

                            <button className="cw-check-btn" onClick={handleMfCheck}>Vérifier</button>
                        </>
                    )}
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
            <div className="glass-panel main-psych-card">
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
                                            {opt.text}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </div>
            </motion.div>
            )}
            </AnimatePresence>

            <style>{`
                .psych-mobile {
                    --theme-color: #00ffff;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    overflow-y: auto;
                    padding: 15px;
                }

                .main-psych-card {
                    width: 100%;
                    padding: 30px 20px;
                    border-radius: 32px;
                    border: 1px solid rgba(0, 255, 255, 0.3);
                    background: rgba(0, 25, 25, 0.85);
                    box-shadow: 0 10px 40px rgba(0, 255, 255, 0.2);
                    display: flex;
                    flex-direction: column;
                    min-height: 450px;
                }

                .card-header {
                    text-align: center;
                    margin-bottom: 25px;
                }

                .title-mobile {
                    color: var(--theme-color);
                    font-size: 1.8rem;
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
                }

                .question-text {
                    font-size: 1.3rem;
                    color: white;
                    text-align: center;
                    margin-bottom: 40px;
                    line-height: 1.4;
                    min-height: 60px;
                }

                .options-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                .option-btn {
                    padding: 20px 15px;
                    background: rgba(0, 255, 255, 0.05);
                    border: 2px solid rgba(0, 255, 255, 0.2);
                    border-radius: 16px;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                    line-height: 1.3;
                }

                .option-btn:active {
                    transform: scale(0.97);
                    background: rgba(0, 255, 255, 0.2);
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
                    border: 2px solid rgba(0, 255, 255, 0.2);
                    border-radius: 14px;
                    background: rgba(0, 25, 25, 0.6);
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
                    background: rgba(0, 255, 255, 0.15);
                    border-color: #00ffff;
                    color: #00ffff;
                    box-shadow: 0 0 12px rgba(0, 255, 255, 0.3);
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
                    background: rgba(255, 204, 0, 0.05);
                    border: 1px solid rgba(255, 204, 0, 0.2);
                    border-radius: 16px;
                    padding: 14px 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .sign-card.expanded {
                    background: rgba(255, 204, 0, 0.1);
                    border-color: rgba(255, 204, 0, 0.4);
                    box-shadow: 0 4px 20px rgba(255, 204, 0, 0.15);
                }
                .sign-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .sign-emoji {
                    font-size: 1.5rem;
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
                    color: #ccc;
                    font-size: 0.92rem;
                    line-height: 1.6;
                    margin-top: 12px;
                    overflow: hidden;
                }

                /* Mots Fléchés */
                .cw-scam-banner {
                    text-align: center;
                    background: linear-gradient(135deg, rgba(255,68,0,0.15), rgba(255,204,0,0.15));
                    border: 2px dashed #ff4400;
                    border-radius: 16px;
                    padding: 16px 12px;
                    margin-bottom: 16px;
                }
                .cw-scam-title {
                    color: #ff4400;
                    font-size: 1.4rem;
                    font-weight: 900;
                    text-shadow: 0 0 10px rgba(255,68,0,0.4);
                    animation: cwBlink 1s infinite alternate;
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
                    background: rgba(255, 68, 68, 0.08);
                    border: 2px solid rgba(255,68,68,0.3);
                    border-radius: 20px;
                }
                .mf-grid {
                    display: grid;
                    gap: 2px;
                    margin: 0 auto 14px;
                    max-width: 370px;
                    background: #333;
                    padding: 2px;
                    border-radius: 6px;
                }
                .mf-cell-blocked {
                    aspect-ratio: 1;
                    background: #1a1a2e;
                    border-radius: 2px;
                }
                .mf-cell-clue {
                    aspect-ratio: 1;
                    background: #2a1a00;
                    border: 1.5px solid rgba(255,140,0,0.4);
                    border-radius: 3px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1px;
                    overflow: hidden;
                }
                .mf-clue-text {
                    font-size: 5.5px;
                    color: #ffcc00;
                    text-align: center;
                    line-height: 1.15;
                    font-weight: 600;
                    word-break: break-word;
                }
                .mf-clue-arrow {
                    font-size: 8px;
                    color: #ff8800;
                    font-weight: 900;
                    margin-top: 1px;
                }
                .cw-cell {
                    aspect-ratio: 1;
                    background: rgba(255,255,255,0.12);
                    border: 1.5px solid rgba(255,255,255,0.25);
                    border-radius: 3px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                .cw-cell.highlighted {
                    background: rgba(0,255,255,0.08);
                    border-color: rgba(0,255,255,0.3);
                }
                .cw-cell.selected {
                    background: rgba(0,255,255,0.2);
                    border-color: #00ffff;
                    box-shadow: 0 0 8px rgba(0,255,255,0.4);
                }
                .cw-cell.correct {
                    background: rgba(0,255,100,0.15);
                    border-color: rgba(0,255,100,0.5);
                }
                .cw-cell.wrong {
                    background: rgba(255,68,68,0.2);
                    border-color: rgba(255,68,68,0.5);
                }
                .cw-cell-letter {
                    font-size: 14px;
                    font-weight: 900;
                    color: white;
                }
                .cw-keyboard {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 4px;
                    margin-bottom: 12px;
                    max-width: 340px;
                    margin-left: auto;
                    margin-right: auto;
                }
                .cw-key-row-bottom {
                    display: flex;
                    gap: 4px;
                    justify-content: center;
                    width: 100%;
                }
                .cw-key {
                    width: 30px;
                    height: 36px;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.15);
                    background: rgba(255,255,255,0.08);
                    color: white;
                    font-size: 13px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .cw-key:active {
                    background: rgba(0,255,255,0.2);
                }
                .cw-key-del {
                    width: 48px;
                    background: rgba(255,68,68,0.12);
                    border-color: rgba(255,68,68,0.3);
                }
                .cw-check-btn {
                    display: block;
                    margin: 0 auto 16px;
                    padding: 10px 30px;
                    border-radius: 14px;
                    border: 2px solid #00ffff;
                    background: rgba(0,255,255,0.1);
                    color: #00ffff;
                    font-size: 1rem;
                    font-weight: bold;
                    cursor: pointer;
                }
                .cw-check-btn:active {
                    background: rgba(0,255,255,0.25);
                }
            `}</style>
        </motion.div>
    );
}
