import React from 'react';

const ICON_V = '8';

export default function NeonIcon({ name, size = 20, glow, className = '', style = {} }) {
  const glowStyle = glow
    ? { filter: `drop-shadow(0 0 ${Math.max(3, size * 0.15)}px ${glow})` }
    : {};
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
        ...glowStyle,
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
