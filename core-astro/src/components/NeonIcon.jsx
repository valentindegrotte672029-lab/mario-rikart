import React from 'react';

const ICON_V = '1';

export default function NeonIcon({ name, size = 20, className = '', style = {} }) {
  return (
    <img
      src={`/images/icons/items/${name}.png?v=${ICON_V}`}
      alt=""
      className={`neon-icon ${className}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        verticalAlign: 'middle',
        display: 'inline-block',
        ...style,
      }}
    />
  );
}
