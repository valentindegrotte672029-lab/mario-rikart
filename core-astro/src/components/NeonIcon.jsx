import React from 'react';

const ICON_V = '21';
// Progressive scaling: small inline icons stay readable, large display icons get much bigger
const scaleSize = (s) => Math.round(s * Math.min(1.45 + s * 0.02, 2.8));

export default function NeonIcon({ name, size = 20, glow, className = '', style = {} }) {
  const scaled = scaleSize(size);
  const glowFilter = glow
    ? `drop-shadow(0 0 ${Math.max(10, scaled * 0.18)}px ${glow}) drop-shadow(0 0 ${Math.max(24, scaled * 0.32)}px ${glow}80)`
    : `drop-shadow(0 0 ${Math.max(8, scaled * 0.16)}px rgba(255,255,255,0.7)) drop-shadow(0 0 ${Math.max(18, scaled * 0.28)}px rgba(255,255,255,0.35))`;
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
        filter: glowFilter || undefined,
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
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </span>
  );
}
