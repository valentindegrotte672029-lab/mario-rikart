import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store/useStore';
import NeonIcon from './NeonIcon';
import ComingSoon from './ComingSoon';
import { socket } from '../socket';

const DAILY_WORDS = {
  "2026-03-24": "EPSCI",
  "2026-03-25": "PATIO",
  "2026-03-26": "TOAD",
  "2026-03-27": "GRISY",
  "2026-03-28": "RICARD",
  "2026-03-29": "KARTING",
  "2026-03-30": "GOURDASSE"
};

const KEYBOARD_ROWS = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['ENTER', 'W', 'X', 'C', 'V', 'B', 'N', 'BACKSPACE']
];

const MAX_GUESSES = 6;

const getLocalIsoDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export default function CemantixContent() {
  const { featureFlags, cemantixProgress, setCemantixProgress } = useStore();
  
  const todayStr = getLocalIsoDate();
  const targetWord = DAILY_WORDS[todayStr];
  
  const dayProgress = cemantixProgress[todayStr] || { guesses: [], status: 'PLAYING', startTime: null, timeTaken: null };
  
  const [currentGuess, setCurrentGuess] = useState('');
  const [invalidMsg, setInvalidMsg] = useState('');

  const isTooEarly = Object.keys(DAILY_WORDS).sort()[0] > todayStr;
  const isOver = Object.keys(DAILY_WORDS).sort().reverse()[0] < todayStr;

  const calculateColors = useCallback((guess, target) => {
    const res = Array(target.length).fill('ABSENT');
    const targetLetters = target.split('');
    const guessLetters = guess.split('');

    guessLetters.forEach((char, i) => {
        if (char === targetLetters[i]) {
            res[i] = 'CORRECT';
            targetLetters[i] = null;
        }
    });

    guessLetters.forEach((char, i) => {
        if (res[i] === 'CORRECT') return;
        const targetIdx = targetLetters.indexOf(char);
        if (targetIdx !== -1) {
            res[i] = 'PRESENT';
            targetLetters[targetIdx] = null;
        }
    });

    return res;
  }, []);

  const keyColors = useMemo(() => {
    if (!targetWord) return {};
    const colors = {};
    dayProgress.guesses.forEach((guess) => {
      const lineColors = calculateColors(guess, targetWord);
      guess.split('').forEach((char, i) => {
        const c = lineColors[i];
        if (c === 'CORRECT') colors[char] = 'CORRECT';
        else if (c === 'PRESENT' && colors[char] !== 'CORRECT') colors[char] = 'PRESENT';
        else if (c === 'ABSENT' && colors[char] !== 'CORRECT' && colors[char] !== 'PRESENT') colors[char] = 'ABSENT';
      });
    });
    return colors;
  }, [dayProgress.guesses, targetWord, calculateColors]);

  const handleKeyPress = (key) => {
    if (!targetWord || dayProgress.status !== 'PLAYING') return;

    if (key === 'ENTER') {
      if (currentGuess.length !== targetWord.length) {
        setInvalidMsg(`Le mot doit faire ${targetWord.length} lettres !`);
        setTimeout(() => setInvalidMsg(''), 2000);
        if (window.navigator?.vibrate) window.navigator.vibrate(200);
        return;
      }
      
      const newGuesses = [...dayProgress.guesses, currentGuess];
      let newStatus = 'PLAYING';
      let finalTimeTaken = dayProgress.timeTaken;
      
      if (currentGuess === targetWord) {
          newStatus = 'WIN';
          if (dayProgress.startTime) {
              finalTimeTaken = Math.round((Date.now() - dayProgress.startTime) / 1000);
              socket.emit('cemantix_win', { timeTaken: finalTimeTaken });
          }
          if (window.navigator?.vibrate) window.navigator.vibrate([100, 50, 100, 50, 200]);
      } else if (newGuesses.length >= MAX_GUESSES) {
          newStatus = 'LOSE';
          if (window.navigator?.vibrate) window.navigator.vibrate([300, 100, 300]);
      } else {
          if (window.navigator?.vibrate) window.navigator.vibrate(50);
      }

      setCemantixProgress({
          ...cemantixProgress,
          [todayStr]: { 
              ...dayProgress,
              guesses: newGuesses, 
              status: newStatus,
              timeTaken: finalTimeTaken
          }
      });
      setCurrentGuess('');
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
      if (window.navigator?.vibrate) window.navigator.vibrate(20);
    } else if (currentGuess.length < targetWord.length) {
      setCurrentGuess(prev => prev + key);
      
      if (!dayProgress.startTime) {
          setCemantixProgress({
              ...cemantixProgress,
              [todayStr]: { ...dayProgress, startTime: Date.now() }
          });
      }

      if (window.navigator?.vibrate) window.navigator.vibrate(20);
    }
  };

  if (!featureFlags.cemantixTab) {
    return <ComingSoon title="LE LABO MOTUS" color="#ffcc00" icon="motus-neon" minimal={true} />;
  }

  return (
    <div style={{ padding: '0 10px 40px 10px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <h1 className="title-mobile waluigi-title" style={{ fontSize: '1.8rem', marginBottom: '5px', textAlign: 'center' }}>MOTUS DAILY</h1>
        
        {!targetWord ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffcc00', textAlign: 'center', padding: '20px' }}>
                <NeonIcon name="motus-neon" size={60} glow="#ffcc00" />
                <h2 style={{ marginTop: '20px', fontFamily: "'Knewave', cursive", fontSize: '1.5rem' }}>
                    {isTooEarly ? "Lancement le 24 Mars" : isOver ? "Saison Terminée !" : "Aucun mot aujourd'hui."}
                </h2>
                <p style={{ marginTop: '10px', opacity: 0.8 }}>Reviens demain pour un nouveau défi.</p>
            </div>
        ) : (
            <>
                <div style={{ color: '#aaa', textAlign: 'center', fontSize: '0.9rem', marginBottom: '15px' }}>
                    Trouve le mot secret en rapport avec le Royaume !
                </div>

                <div className="motus-grid" style={{
                    display: 'grid',
                    gridTemplateRows: `repeat(${MAX_GUESSES}, 1fr)`,
                    gap: '5px',
                    width: '100%',
                    maxWidth: '350px',
                    margin: '0 auto',
                    flex: 1,
                    minHeight: '280px'
                }}>
                    {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
                        const guess = dayProgress.guesses[rowIndex];
                        const isCurrentRow = rowIndex === dayProgress.guesses.length;
                        const lineWord = guess || (isCurrentRow ? currentGuess.padEnd(targetWord.length, ' ') : ''.padEnd(targetWord.length, ' '));
                        const colors = guess ? calculateColors(guess, targetWord) : Array(targetWord.length).fill('EMPTY');

                        return (
                            <div key={rowIndex} style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${targetWord.length}, 1fr)`,
                                gap: '5px'
                            }}>
                                {lineWord.split('').map((char, colIndex) => {
                                    let bg = 'rgba(255, 255, 255, 0.05)';
                                    let border = '2px solid rgba(255, 255, 255, 0.1)';
                                    
                                    if (colors[colIndex] === 'CORRECT') { bg = '#4CAF50'; border = '2px solid #4CAF50'; }
                                    else if (colors[colIndex] === 'PRESENT') { bg = '#FFC107'; border = '2px solid #FFC107'; }
                                    else if (colors[colIndex] === 'ABSENT') { bg = '#444'; border = '2px solid #333'; }
                                    else if (char !== ' ') { border = '2px solid #aaa'; }

                                    return (
                                        <motion.div
                                            key={colIndex}
                                            initial={{ rotateX: 0 }}
                                            animate={guess ? { rotateX: 360 } : {}}
                                            transition={{ duration: 0.5, delay: colIndex * 0.1 }}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: bg, border, borderRadius: '8px',
                                                color: 'white', fontSize: '1.4rem', fontWeight: 'bold',
                                                textTransform: 'uppercase', height: '100%', aspectRatio: '1/1'
                                            }}
                                        >
                                            {char}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence>
                    {invalidMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: '#ff3366', textAlign: 'center', fontWeight: 'bold', minHeight: '20px', margin: '10px 0' }}>
                            {invalidMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {dayProgress.status === 'WIN' && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '15px', borderRadius: '15px', color: '#4CAF50', border: '2px solid #4CAF50', textAlign: 'center', margin: '15px 0' }}>
                        <h2 style={{ fontFamily: "'Knewave', cursive", fontSize: '1.5rem', marginBottom: '5px' }}>🏆 VICTOIRE !</h2>
                        <p>Tu as trouvé le mot en <strong>{dayProgress.timeTaken != null ? dayProgress.timeTaken : '?'}s</strong> !</p>
                        <p style={{ fontSize: '0.8rem', marginTop: '5px' }}>💰 +200 pièces créditées</p>
                    </motion.div>
                )}

                {dayProgress.status === 'LOSE' && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'rgba(255, 51, 102, 0.2)', padding: '15px', borderRadius: '15px', color: '#ff3366', border: '2px solid #ff3366', textAlign: 'center', margin: '15px 0' }}>
                        <h2 style={{ fontFamily: "'Knewave', cursive", fontSize: '1.5rem', marginBottom: '5px' }}>PERDU...</h2>
                        <p>Le mot était <strong>{targetWord}</strong>. Retente ta chance demain !</p>
                    </motion.div>
                )}

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                    {KEYBOARD_ROWS.map((row, rIdx) => (
                        <div key={rIdx} style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            {row.map((key) => {
                                let keyBg = 'rgba(255, 255, 255, 0.1)';
                                if (keyColors[key] === 'CORRECT') keyBg = '#4CAF50';
                                else if (keyColors[key] === 'PRESENT') keyBg = '#FFB300';
                                else if (keyColors[key] === 'ABSENT') keyBg = '#333';

                                const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
                                return (
                                    <button
                                        key={key}
                                        onClick={() => handleKeyPress(key)}
                                        style={{
                                            border: 'none', background: keyBg, color: 'white',
                                            padding: isSpecial ? '12px 10px' : '12px 0',
                                            borderRadius: '6px', fontWeight: 'bold',
                                            flex: isSpecial ? '1.5' : '1',
                                            fontSize: isSpecial ? '0.75rem' : '1.1rem',
                                            cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center'
                                        }}
                                    >
                                        {key === 'BACKSPACE' ? <NeonIcon name="waluigi-transparent" size={16} /> : key === 'ENTER' ? 'VALIDER' : key}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </>
        )}
    </div>
  );
}
