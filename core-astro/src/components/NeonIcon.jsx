import React from 'react';

const ICON_V = '10';

export default function NeonIcon({ name, size = 20, glow, className = '', style = {} }) {
  const glowFilter = glow
    ? `drop-shadow(0 0 ${Math.max(4, size * 0.18)}px ${glow}) drop-shadow(0 0 ${Math.max(8, size * 0.35)}px ${glow})`
    : '';
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
          mixBlendMode: 'screen',
        }}
      />
    </span>
  );
}
