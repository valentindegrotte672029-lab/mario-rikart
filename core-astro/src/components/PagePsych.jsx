import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, RotateCcw } from 'lucide-react';

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
            { text: "Spot 🐶", value: "spot" },
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
            { text: "Le chef cuisto du Massala Bar 👨‍🍳", value: "massala" }
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
            { text: "La PC 💻", value: "pc" },
            { text: "Le discours RDA 🗣️🇩🇪", value: "rda" }
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

export default function PagePsych() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isFinished, setIsFinished] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);

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
                setIsCalculating(false);
                setIsFinished(true);
            }, 2000); // Faux chargement de 2 secondes
        }
    };

    const restartTest = () => {
        setCurrentQuestionIndex(0);
        setAnswers({});
        setIsFinished(false);
        setIsCalculating(false);
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
                        <p style={{ color: '#white', marginBottom: '20px' }}>
                            Les résultats seront bientôt disponibles lors de la prochaine mise à jour de l'administration.
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

            <style>{`
                .psych-mobile {
                    --theme-color: #00ffff;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
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
            `}</style>
        </motion.div>
    );
}
