import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

import { FlaskConical, Skull, Send } from 'lucide-react';
import useStore from '../store/useStore';
import { socket } from '../socket';
import NeonIcon from './NeonIcon';

const INGREDIENTS = [
  { id: 'vodka', name: 'Vodka', emoji: '🍾', icon: 'flask-purple-atomic' },
  { id: 'lait', name: 'Lait tiède', emoji: '🥛', icon: 'flask-blue-beaker' },
  { id: 'piment', name: 'Piment pur', emoji: '🌶️', icon: 'flask-orange-distill' },
  { id: 'tabasco', name: 'Tabasco', emoji: '🔥', icon: 'fire-flower-pixel' },
  { id: 'cornichon', name: 'Jus de cornichon', emoji: '🥒', icon: 'flask-green-erlenmeyer' },
];

const LISTEUX = [
  'Luigi', 'Toad', 'Peach', 'Mario', 'Wario'
];

export default function PageToad() {
  const { username } = useStore();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedVictim, setSelectedVictim] = useState('');
  const [isSending, setIsSending] = useState(false);

  const toggleIngredient = (id) => {
    setSelectedIngredients(prev => {
      const isSelected = prev.includes(id);
      if (isSelected) {
        return prev.filter(i => i !== id);
      } else {
        if (prev.length >= 3) return prev; // Max 3 limit
        return [...prev, id];
      }
    });
    if (window.navigator?.vibrate) window.navigator.vibrate(20);
  };

  const handleSendMix = () => {
    if (selectedIngredients.length === 0 || !selectedVictim) return;

    setIsSending(true);
    if (window.navigator?.vibrate) window.navigator.vibrate([50, 100, 50]);

    const mixName = "Mélange " + selectedIngredients.map(id => INGREDIENTS.find(i => i.id === id).emoji).join('');

    // Envoi de la commande spéciale au Master
    socket.emit('new_order', {
      username: username || "Anonyme",
      item: `🧪 ${mixName} pour ${selectedVictim} (Atroce)`
    });

    setTimeout(() => {
      setSelectedIngredients([]);
      setSelectedVictim('');
      setIsSending(false);
    }, 1500);
  };

  return (
    <motion.div
      className="page-mobile toad-mobile"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-panel mobile-card toad-card">
        <h1 className="title-mobile toad-title">TOAD-XIQUE</h1>
        <p className="subtitle" style={{ textAlign: 'center', color: '#ffbbcc', marginBottom: '5px', fontStyle: 'italic', fontSize: '0.9rem' }}>
          "Créer un mélange atroce qu'un listeux va devoir raout" <NeonIcon name="toad-vomit" size={20} />
        </p>
        <p className="subtitle" style={{ textAlign: 'center', color: '#ff3366', marginBottom: '15px', fontWeight: 'bold', fontSize: '0.8rem' }}>
          <NeonIcon name="warning-triangle" size={16} /> MAX 3 INGRÉDIENTS <NeonIcon name="warning-triangle" size={16} />
        </p>

        {/* Section Ingrédients */}
        <section className="toad-section">
          <div className="section-header">
            <FlaskConical size={20} color="#ff3366" />
            <h2>1. Choisir les ingrédients</h2>
          </div>

          <div className="ingredients-grid">
            {INGREDIENTS.map(ing => (
              <button
                key={ing.id}
                className={`ingredient-btn ${selectedIngredients.includes(ing.id) ? 'selected' : ''}`}
                onClick={() => toggleIngredient(ing.id)}
              >
                <span className="emoji"><NeonIcon name={ing.icon} size={28} /></span>
                <span className="name">{ing.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section Victime */}
        <section className="toad-section">
          <div className="section-header">
            <Skull size={20} color="#ff3366" />
            <h2>2. Choisir la victime</h2>
          </div>

          <div className="victims-list">
            {LISTEUX.map(victim => (
              <button
                key={victim}
                className={`victim-btn ${selectedVictim === victim ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedVictim(victim);
                  if (window.navigator?.vibrate) window.navigator.vibrate(20);
                }}
              >
                {victim}
              </button>
            ))}
          </div>
        </section>

        {/* Bouton Envoi */}
        <button
          className={`btn-primary send-mix-btn ${isSending ? 'sending' : ''}`}
          disabled={selectedIngredients.length === 0 || !selectedVictim || isSending}
          onClick={handleSendMix}
        >
          <Send size={24} className="btn-icon" />
          <span>{isSending ? 'Mélange envoyé !' : 'Servir le mélange'}</span>
        </button>
      </div>

      <style>{`
        .toad-mobile {
          --theme-color: #ff3366;
          --theme-dark: #330a14;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
        }

        .toad-card {
          width: 100%;
          padding: 20px 15px 80px 15px; /* Added bottom padding for tab bar */
          border-radius: 32px;
          border: 1px solid rgba(255, 51, 102, 0.3);
          background: rgba(25, 5, 10, 0.65);
          backdrop-filter: blur(15px);
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .toad-title {
          color: white;
          font-size: 2.2rem;
          font-weight: 900;
          text-align: center;
          margin-bottom: 5px;
          text-shadow: 0 0 20px rgba(255, 51, 102, 0.8);
          letter-spacing: 2px;
        }

        .toad-section {
          background: transparent;
          border-radius: 0;
          padding: 15px;
          margin-bottom: 15px;
          border: none;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .section-header h2 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #eee;
        }

        /* Grille des ingrédients */
        .ingredients-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .ingredient-btn {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          color: white;
          transition: all 0.2s ease;
        }

        .ingredient-btn .emoji {
          font-size: 1.6rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ingredient-btn .name {
          font-size: 0.75rem;
          text-align: center;
          font-weight: 500;
          line-height: 1.1;
        }

        .ingredient-btn.selected {
          background: transparent;
          border: none;
          box-shadow: none;
          transform: scale(1.05);
          filter: drop-shadow(0 0 10px rgba(255, 51, 102, 0.6)) drop-shadow(0 0 20px rgba(255, 51, 102, 0.3));
        }

        /* Liste des victimes */
        .victims-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .victim-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid transparent;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .victim-btn.selected {
          background: var(--theme-color);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 51, 102, 0.5);
          transform: scale(1.05);
        }

        /* Bouton Envoi */
        .send-mix-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff3366, #ff0044);
          color: white;
          padding: 18px;
          border-radius: 20px;
          font-size: 1.2rem;
          font-weight: bold;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 10px;
          box-shadow: 0 10px 30px rgba(255, 51, 102, 0.4);
        }

        .send-mix-btn:disabled {
          background: #555;
          box-shadow: none;
          opacity: 0.5;
          transform: none;
        }

        .send-mix-btn.sending {
          background: #4CAF50;
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.4);
        }
      `}</style>
    </motion.div>
  );
}
