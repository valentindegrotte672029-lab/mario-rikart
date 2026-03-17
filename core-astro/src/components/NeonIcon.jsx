import React from 'react';

const ICON_V = '2';

export default function NeonIcon({ name, size = 20, className = '', style = {} }) {
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
