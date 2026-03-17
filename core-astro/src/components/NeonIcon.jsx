import React from 'react';

const ICON_V = '11';

export default function NeonIcon({ name, size = 20, glow, className = '', style = {} }) {
  const glowFilter = glow
    ? `drop-shadow(0 0 ${Math.max(6, size * 0.22)}px ${glow}) drop-shadow(0 0 ${Math.max(12, size * 0.4)}px ${glow}80)`
    : `drop-shadow(0 0 ${Math.max(4, size * 0.15)}px rgba(255,255,255,0.6)) drop-shadow(0 0 ${Math.max(8, size * 0.3)}px rgba(255,255,255,0.25))`;
  return (
    <span
      className={`neon-icon ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        width: size,
        height: size,
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
