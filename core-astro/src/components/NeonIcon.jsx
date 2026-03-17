import React from 'react';

const ICON_V = '12';
// Progressive scaling: small inline icons stay readable, large display icons get much bigger
const scaleSize = (s) => Math.round(s * Math.min(1.3 + s * 0.02, 2.5));

export default function NeonIcon({ name, size = 20, glow, className = '', style = {} }) {
  const scaled = scaleSize(size);
  const glowFilter = glow
    ? `drop-shadow(0 0 ${Math.max(6, scaled * 0.12)}px ${glow}) drop-shadow(0 0 ${Math.max(12, scaled * 0.22)}px ${glow}80)`
    : `drop-shadow(0 0 ${Math.max(4, scaled * 0.08)}px rgba(255,255,255,0.6)) drop-shadow(0 0 ${Math.max(8, scaled * 0.16)}px rgba(255,255,255,0.25))`;
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
        ...style,
      }}
    >
      <img
        src={`/images/icons/items/${name}.png?v=${ICON_V}`}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </span>
  );
}
