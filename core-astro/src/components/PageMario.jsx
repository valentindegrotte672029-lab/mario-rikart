import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Send, X, Type } from 'lucide-react';
import useStore from '../store/useStore';
import { socket } from '../socket';

const STICKERS_GALLERY = ['🍄', '⭐️', '🔥', '💩', '💸', '🍷', '🚬', '🤡'];

export default function PageMario() {
  const { username } = useStore();
  const [photo, setPhoto] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPhoto(imageUrl);
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
    }
  };

  const addSticker = (emoji) => {
    setStickers(prev => [
      ...prev,
      { id: Date.now(), emoji, x: 0, y: 0 }
    ]);
  };

  const handleSend = () => {
    setIsSending(true);
    if (window.navigator?.vibrate) window.navigator.vibrate([50, 100, 50]);

    // Envoi de la notification au Master
    socket.emit('new_order', {
      username: username || "Anonyme",
      item: `📸 A balancé un BeReal épique ! "${caption}"`
    });

    setTimeout(() => {
      setPhoto(null);
      setStickers([]);
      setCaption('');
      setIsSending(false);
    }, 1500);
  };

  const cancelPhoto = () => {
    setPhoto(null);
    setStickers([]);
    setCaption('');
  };

  return (
    <motion.div
      className="page-mobile mario-mobile"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="tears-overlay"></div>

      <div className="glass-panel mobile-card mario-card">
        <h1 className="title-mobile mario-title">MARIO</h1>
        <p className="subtitle sad-subtitle">Snappe tes Goumins en direct 📸</p>

        {!photo ? (
          <div className="capture-section">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              className="huge-btn capture-btn"
              onClick={() => fileInputRef.current.click()}
            >
              <Camera size={50} />
              <span>PRENDRE UN BEREAL</span>
            </button>
            <p className="desc" style={{ marginTop: '20px', color: '#ffaaaa' }}>
              Montre au Master ce qu'il se passe ici !
            </p>
          </div>
        ) : (
          <div className="editor-section">
            <div className="photo-container">
              <img src={photo} alt="BeReal" className="captured-photo" />

              {/* Le texte par dessus */}
              {caption && (
                <motion.div className="photo-caption" drag dragConstraints={{ top: -150, bottom: 150, left: -100, right: 100 }}>
                  {caption}
                </motion.div>
              )}

              {/* Les stickers par dessus */}
              {stickers.map(sticker => (
                <motion.div
                  key={sticker.id}
                  className="draggable-sticker"
                  drag
                  dragConstraints={{ top: -200, left: -150, right: 150, bottom: 200 }}
                  whileDrag={{ scale: 1.2 }}
                >
                  {sticker.emoji}
                </motion.div>
              ))}
            </div>

            <div className="editor-tools">
              {/* Saisie texte */}
              <div className="caption-input-container">
                <Type size={18} color="#aaa" />
                <input
                  type="text"
                  placeholder="Ajoute un texte giga sombre..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="caption-input"
                />
              </div>

              {/* Galerie Stickers */}
              <div className="stickers-gallery">
                {STICKERS_GALLERY.map(emoji => (
                  <button key={emoji} className="sticker-picker-btn" onClick={() => addSticker(emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="editor-actions">
                <button className="btn-secondary cancel-btn" onClick={cancelPhoto}>
                  <X size={20} /> Annuler
                </button>
                <button className={`btn-primary send-btn ${isSending ? 'sending' : ''}`} onClick={handleSend} disabled={isSending}>
                  <Send size={20} />
                  {isSending ? 'Envoyé!' : 'Envoyer au Master'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .mario-mobile {
          --theme-color: #aa0000;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          position: relative;
        }

        .tears-overlay {
          position: absolute;
          top: -20%; left: -20%; right: -20%; bottom: -20%;
          background: radial-gradient(circle at top, rgba(150, 0, 0, 0.4), transparent 70%);
          z-index: -1;
        }

        .mario-card {
          width: 100%;
          padding: 20px 15px;
          border-radius: 32px;
          border-color: rgba(255, 0, 0, 0.3);
          background: rgba(30, 0, 0, 0.75);
          backdrop-filter: blur(15px);
          text-align: center;
          max-height: 90vh;
          overflow-y: auto;
        }

        .mario-title {
          font-size: 2.8rem;
          color: #ff3333;
          letter-spacing: 2px;
          font-weight: 900;
          margin-bottom: 5px;
          text-shadow: 0 0 15px rgba(255,51,51,0.5);
        }

        .sad-subtitle {
          color: #ff9999;
          font-style: italic;
          margin-bottom: 25px;
          font-size: 0.9rem;
        }

        .capture-section {
          padding: 20px 0;
        }

        .huge-btn.capture-btn {
          width: 100%;
          aspect-ratio: 1;
          max-width: 250px;
          margin: 0 auto;
          background: linear-gradient(135deg, #ff3333, #aa0000);
          border: none;
          border-radius: 50%;
          color: white;
          font-weight: 900;
          font-size: 1.2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          box-shadow: 0 10px 30px rgba(170, 0, 0, 0.5);
          transition: transform 0.1s;
        }

        .huge-btn.capture-btn:active {
          transform: scale(0.95);
        }

        /* Editor Section */
        .photo-container {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          background: #000;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 15px;
          border: 2px solid rgba(255, 51, 51, 0.3);
        }

        .captured-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .draggable-sticker {
          position: absolute;
          top: 30%;
          left: 40%;
          font-size: 3.5rem;
          cursor: grab;
          user-select: none;
          touch-action: none;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
        }

        .draggable-sticker:active {
          cursor: grabbing;
        }

        .photo-caption {
          position: absolute;
          top: 70%;
          left: 10%;
          width: 80%;
          background: rgba(0,0,0,0.6);
          color: white;
          padding: 10px;
          font-size: 1.2rem;
          font-weight: bold;
          text-align: center;
          cursor: grab;
          touch-action: none;
          border-radius: 12px;
          backdrop-filter: blur(5px);
        }

        .editor-tools {
          background: rgba(0,0,0,0.5);
          padding: 15px;
          border-radius: 20px;
        }

        .caption-input-container {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.1);
          padding: 10px 15px;
          border-radius: 12px;
          margin-bottom: 15px;
        }

        .caption-input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          font-size: 1rem;
          outline: none;
        }

        .caption-input::placeholder {
          color: #888;
        }

        .stickers-gallery {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }

        .sticker-picker-btn {
          background: rgba(255,255,255,0.05);
          border: none;
          font-size: 1.8rem;
          padding: 10px;
          border-radius: 12px;
          transition: background 0.2s;
        }

        .sticker-picker-btn:active {
          background: rgba(255,255,255,0.2);
        }

        .editor-actions {
          display: flex;
          gap: 10px;
        }

        .btn-secondary.cancel-btn {
          flex: 1;
          background: rgba(255,255,255,0.1);
          color: white;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 15px; border-radius: 12px; border: none;
        }

        .btn-primary.send-btn {
          flex: 2;
          background: linear-gradient(135deg, #ff3333, #cc0000);
          color: white;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 15px; border-radius: 12px; border: none; font-weight: bold;
        }

        .btn-primary.send-btn.sending {
          background: #4CAF50;
        }
      `}</style>
    </motion.div>
  );
}
