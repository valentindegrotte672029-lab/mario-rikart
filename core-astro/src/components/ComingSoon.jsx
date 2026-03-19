import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import NeonIcon from './NeonIcon';

export default function ComingSoon({ title, icon = "clock-neon", color = "#ffcc00", iconSize = 80, minimal = false }) {
  if (minimal) {
    return (
      <motion.div 
        className="coming-soon-container minimal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '100px 20px',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px', textShadow: `0 0 10px ${color}` }}>
          {title.toUpperCase()}
        </h2>
        <div style={{ color: color, fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.9 }}>
          CETTE SECTION EST ACTUELLEMENT FERMÉE
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="coming-soon-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '24px',
        border: `1px dashed ${color}44`,
        margin: '20px'
      }}
    >
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <NeonIcon name={icon} size={iconSize} glow={color} />
        <motion.div
           animate={{ rotate: 360 }}
           transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
           style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, border: `2px dotted ${color}44`, borderRadius: '50%' }}
        />
      </div>
      
      <h2 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 900, marginBottom: '10px', textShadow: `0 0 10px ${color}` }}>
        {title.toUpperCase()}
      </h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: color, fontWeight: 'bold', fontSize: '1rem', letterSpacing: '1px' }}>
        <Clock size={18} />
        BIENTÔT DISPONIBLE
      </div>
      
      <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '20px', fontSize: '0.9rem', maxWidth: '280px', lineHeight: '1.5' }}>
        Les ingénieurs du Royaume Champignon travaillent d'arrache-pied pour ouvrir cette section.
      </p>

      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        {[1, 2, 3].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            style={{ width: '8px', height: '8px', background: color, borderRadius: '50%' }}
          />
        ))}
      </div>
    </motion.div>
  );
}
