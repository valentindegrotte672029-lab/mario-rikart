import React from 'react';

const ICON_V = '21';
// Progressive scaling: small inline icons stay readable, large display icons get much bigger
const scaleSize = (s) => Math.round(s * Math.min(1.6 + s * 0.02, 3.0));

export default function NeonIcon({ name, size = 20, glow, className = '', style = {} }) {
  const scaled = scaleSize(size);
  const glowFilter = glow
    ? `drop-shadow(0 0 ${Math.max(4, scaled * 0.08)}px ${glow}) drop-shadow(0 0 ${Math.max(12, scaled * 0.20)}px ${glow}cc) drop-shadow(0 0 ${Math.max(28, scaled * 0.45)}px ${glow}80)`
    : `drop-shadow(0 0 ${Math.max(3, scaled * 0.06)}px rgba(255,255,255,0.9)) drop-shadow(0 0 ${Math.max(10, scaled * 0.18)}px rgba(255,255,255,0.5)) drop-shadow(0 0 ${Math.max(22, scaled * 0.35)}px rgba(255,255,255,0.25))`;

  return (
    <span
      className={`neon-icon ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        width: scaled,
        height: scaled,
        flexShrink: 0,
        filter: `${glowFilter} contrast(1.1) brightness(1.1)`,
        overflow: 'hidden',
        background: 'transparent',
        ...style,
      }}
    >
      <div style={{
        width: '90%',
        height: '90%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
      }}>
        <img
          src={`/images/icons/items/${name}.png?v=${ICON_V}`}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
            background: 'transparent',
          }}
        />
      </div>
    </span>
  );
}
