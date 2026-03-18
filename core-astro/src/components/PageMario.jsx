import React, { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Camera, Send, X, Type, PlusSquare, SwitchCamera } from 'lucide-react';
import useStore from '../store/useStore';
import { socket } from '../socket';
import { compressImage } from '../utils/imageCompressor';
import html2canvas from 'html2canvas';
import NeonIcon from './NeonIcon';

const STICKERS_GALLERY = [
  { id: 'mushroom', icon: 'red-mushroom-spotted' },
  { id: 'star', icon: 'star-purple' },
  { id: 'fire', icon: 'fire-flower-pixel' },
  { id: 'shell', icon: 'shell-spiked-green' },
  { id: 'coins', icon: 'coins-stack' },
  { id: 'flask', icon: 'flask-purple-atomic' },
  { id: 'banana', icon: 'banana-peel-cyan' },
  { id: 'wario', icon: 'wario-face' },
];

export default function PageMario() {
  const { username, bereals } = useStore();
  const [step, setStep] = useState('FEED'); // FEED, CAPTURE_BACK, CAPTURE_FRONT, EDIT
  const [swappedPosts, setSwappedPosts] = useState({});
  const [backPhoto, setBackPhoto] = useState(null);
  const [frontPhoto, setFrontPhoto] = useState(null);

  const [stickers, setStickers] = useState([]);
  const [caption, setCaption] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fileInputBackRef = useRef(null);
  const fileInputFrontRef = useRef(null);

  const handleCaptureBack = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
      const base64 = await compressImage(file, 800);
      setBackPhoto(base64);
      setStep('CAPTURE_FRONT');
    }
  };

  const handleCaptureFront = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
      setStep('PROCESSING'); // Étape de chargement visuel accélérée au lieu de freeze
      const base64 = await compressImage(file, 400);
      setFrontPhoto(base64);
      setStep('EDIT');
    }
  };

  const addSticker = (stickerIcon) => {
    setStickers(prev => [
      ...prev,
      { id: Date.now(), icon: stickerIcon, x: 0, y: 0 }
    ]);
  };

  const toggleSwap = (id) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(20);
    setSwappedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async () => {
    setIsSending(true);
    if (window.navigator?.vibrate) window.navigator.vibrate([50, 100, 50]);

    // Prendre un screenshot du container avec html2canvas (pour incruster texte et emojis d'un coup)
    const element = document.querySelector('.photo-editor-container');
    const bgImg = element.querySelector('.bg-photo');
    const frontImg = element.querySelector('.front-photo-inset img');

    try {
      // 1. Image Normale
      const canvas1 = await html2canvas(element, {
        backgroundColor: null,
        scale: 1 // Garder une taille raisonnable
      });
      const finalImageBase64 = canvas1.toDataURL('image/jpeg', 0.6);

      // 2. Inversion Temporaire pour capture
      bgImg.src = frontPhoto;
      frontImg.src = backPhoto;

      const canvas2 = await html2canvas(element, { backgroundColor: null, scale: 1 });
      const swappedImageBase64 = canvas2.toDataURL('image/jpeg', 0.6);

      // Restauration UI Editor
      bgImg.src = backPhoto;
      frontImg.src = frontPhoto;

      // Envoi de la notification et de l'image
      socket.emit('new_bereal', {
        caption,
        image: finalImageBase64,
        swappedImage: swappedImageBase64
      });

    } catch (err) {
      console.error("Erreur html2canvas:", err);
    } // fallback silencieux

    setTimeout(() => {
      setBackPhoto(null);
      setFrontPhoto(null);
      setStickers([]);
      setCaption('');
      setStep('FEED');
      setIsSending(false);
    }, 1000);
  };

  const cancelPhoto = () => {
    setBackPhoto(null);
    setFrontPhoto(null);
    setStickers([]);
    setCaption('');
    setStep('FEED');
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
        <h1 className="title-mobile mario-title">BeMARIO</h1>
        <p className="subtitle sad-subtitle">Capturez vos B.O. en temps réel <Camera size={18} /></p>

        {step === 'FEED' && (
          <div className="feed-section">
            <button className="btn-primary create-bereal-btn" onClick={() => setStep('CAPTURE_BACK')}>
              <PlusSquare size={28} color="white" /> Envoyer un BeMario
            </button>

            <div className="bereal-list">
              {bereals.length === 0 ? (
                <p className="empty-feed">Aucun post pour le moment. Sois le premier !</p>
              ) : (
                bereals.map(post => (
                  <div className="bereal-post" key={post.id}>
                    <div className="post-header">
                      <strong>{post.username}</strong>
                      <span className="post-time">{new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <img
                      src={swappedPosts[post.id] && post.swappedImage ? post.swappedImage : post.image}
                      alt="BeReal"
                      className="post-image"
                      onClick={() => toggleSwap(post.id)}
                      style={{ cursor: post.swappedImage ? 'pointer' : 'default' }}
                    />
                    {post.caption && <p className="post-caption-text">{post.caption}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === 'CAPTURE_BACK' && (
          <div className="capture-section">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCaptureBack}
              ref={fileInputBackRef}
              style={{ display: 'none' }}
            />
            <button
              className="huge-btn capture-btn"
              onClick={() => fileInputBackRef.current.click()}
            >
              <Camera size={80} color="#ff3333" />
              <span>1. DÉCOR (Arrière)</span>
            </button>
            <button className="btn-secondary cancel-capture-btn" onClick={cancelPhoto}>Annuler</button>
          </div>
        )}

        {step === 'CAPTURE_FRONT' && (
          <div className="capture-section">
              <h3 style={{ color: 'white', marginBottom: '10px' }}><Camera size={20} /> Décor capturé !</h3>
            <input
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleCaptureFront}
              ref={fileInputFrontRef}
              style={{ display: 'none' }}
            />
            <button
              className="huge-btn capture-btn front-capture"
              onClick={() => fileInputFrontRef.current.click()}
            >
              <SwitchCamera size={80} color="#00ffcc" />
              <span>2. SELFIE (Avant)</span>
            </button>
            <button className="btn-secondary cancel-capture-btn" onClick={cancelPhoto}>Annuler</button>
          </div>
        )}

        {step === 'PROCESSING' && (
          <div className="capture-section" style={{ padding: '80px 0' }}>
            <h3 className="blink-text" style={{ color: '#00ffcc', fontSize: '1.5rem' }}>Développement... <Camera size={24} /></h3>
          </div>
        )}

        {step === 'EDIT' && (
          <div className="editor-section">
            <div className="photo-editor-wrapper">
              <div className="photo-container photo-editor-container">
                {/* Photo Arrière-plan */}
                <img src={backPhoto} alt="Back" className="captured-photo bg-photo" />

                {/* Photo Selfie incrustée */}
                <div className="front-photo-inset">
                  <img src={frontPhoto} alt="Front" className="captured-photo" />
                </div>

                {/* Les stickers par dessus */}
                {stickers.map(sticker => (
                  <motion.div
                    key={sticker.id}
                    className="draggable-sticker"
                    drag
                    dragConstraints={{ top: -200, left: -150, right: 150, bottom: 200 }}
                    whileDrag={{ scale: 1.2 }}
                    onClick={() => setStickers(prev => prev.filter(s => s.id !== sticker.id))}
                  >
                    <NeonIcon name={sticker.icon} size={36} />
                  </motion.div>
                ))}
              </div>

              {/* Le texte EN DESSOUS (Zone blanche/transparente du container html2canvas) */}
              {caption && (
                <div className="caption-display-area">
                  <p className="caption-display-text">{caption}</p>
                </div>
              )}
            </div>

            <div className="editor-tools">
              <div className="caption-input-container">
                <Type size={18} color="#aaa" />
                <input
                  type="text"
                  placeholder="Légende B.O...."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="caption-input"
                />
              </div>

              <div className="stickers-gallery" data-block-app-swipe="true">
                {STICKERS_GALLERY.map(s => (
                  <button key={s.id} className="sticker-picker-btn" onClick={() => addSticker(s.icon)}>
                    <NeonIcon name={s.icon} size={28} />
                  </button>
                ))}
              </div>

              <div className="editor-actions">
                <button className="btn-secondary cancel-btn" onClick={cancelPhoto}>
                  <X size={20} /> Annuler
                </button>
                <button className={`btn-primary send-btn ${isSending ? 'sending' : ''}`} onClick={handleSend} disabled={isSending}>
                  <Send size={20} />
                  {isSending ? 'Upload...' : 'Publier'}
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
          padding: 20px 15px 80px 15px; /* Padding bottom for Mobile Tab Bar */
          border-radius: 32px;
          border-color: rgba(255, 0, 0, 0.3);
          background: rgba(30, 0, 0, 0.75);
          backdrop-filter: blur(15px);
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mario-title {
          font-size: 2.8rem;
          color: #ff3333;
          letter-spacing: 2px;
          font-weight: 900;
          margin-bottom: 5px;
          text-align: center;
          text-shadow: 0 0 15px rgba(255,51,51,0.5);
        }

        .sad-subtitle {
          color: #ff9999;
          font-style: italic;
          margin-bottom: 25px;
          font-size: 0.9rem;
          text-align: center;
        }

        /* FEED SECTION */
        .feed-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .create-bereal-btn {
          width: 100%;
          background: linear-gradient(135deg, #ff3333, #aa0000);
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          padding: 15px;
          border-radius: 15px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(170, 0, 0, 0.5);
          border: none;
        }

        .bereal-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty-feed {
          text-align: center;
          color: #888;
          font-style: italic;
          padding: 20px;
        }

        .bereal-post {
          background: rgba(0,0,0,0.5);
          border-radius: 20px;
          padding: 15px;
          border: 1px solid rgba(255,51,51,0.2);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          color: white;
        }
        
        .post-time { color: #888; font-size: 0.8rem; }

        .post-image {
          width: 100%;
          border-radius: 15px;
          aspect-ratio: 3/4;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .post-caption-text {
          margin-top: 10px;
          color: #ddd;
          font-weight: bold;
          text-align: center;
        }

        /* CAPTURE SECTION */
        .capture-section {
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
        }

        .huge-btn.capture-btn {
          width: 100%;
          aspect-ratio: 1;
          max-width: 200px;
          background: linear-gradient(135deg, #111, #333);
          border: 4px solid #ff3333;
          border-radius: 50%;
          color: white;
          font-weight: 900;
          font-size: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 15px;
          box-shadow: 0 10px 30px rgba(170, 0, 0, 0.5);
          transition: transform 0.1s;
        }

        .huge-btn.capture-btn.front-capture {
          border-color: #00ffcc;
          box-shadow: 0 10px 30px rgba(0, 255, 204, 0.3);
        }

        .huge-btn.capture-btn:active {
          transform: scale(0.95);
        }

        .cancel-capture-btn {
          background: transparent;
          color: #888;
          border: none;
          text-decoration: underline;
        }

        .blink-text {
          animation: blink 1s infinite alternate;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        @keyframes blink {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }

        /* EDITOR SECTION */
        .photo-container {
          position: relative;
          width: 100%;
          aspect-ratio: 3/4;
          background: #000;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 15px;
          border: 2px solid rgba(255, 51, 51, 0.3);
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          isolation: isolate;
        }

        .captured-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .bg-photo {
          width: 100%;
          height: 100%;
        }

        .front-photo-inset {
          position: absolute;
          top: 15px;
          left: 15px;
          width: 30%;
          aspect-ratio: 3/4;
          border-radius: 12px;
          border: 3px solid black;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5);
          z-index: 10;
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
          z-index: 20;
          will-change: transform;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .draggable-sticker:active { cursor: grabbing; }

        .photo-caption-overlay {
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
          z-index: 20;
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

        .caption-input::placeholder { color: #888; }

        .stickers-gallery {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }

        .sticker-picker-btn {
          background: transparent;
          border: none;
          font-size: 1.8rem;
          padding: 8px;
          border-radius: 12px;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sticker-picker-btn:active { background: rgba(255,255,255,0.1); }

        .editor-actions { display: flex; gap: 10px; }

        .btn-secondary.cancel-btn {
          flex: 1; background: rgba(255,255,255,0.1); color: white;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 15px; border-radius: 12px; border: none;
        }

        .btn-primary.send-btn {
          flex: 2; background: linear-gradient(135deg, #ff3333, #cc0000); color: white;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 15px; border-radius: 12px; border: none; font-weight: bold;
        }

        .btn-primary.send-btn.sending { background: #4CAF50; }
      `}</style>
    </motion.div>
  );
}
