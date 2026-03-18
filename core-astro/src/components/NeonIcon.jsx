import React from 'react';

const ICON_V = '23';
// Progressive scaling: small inline icons stay readable, large display icons get much bigger
const scaleSize = (s) => Math.round(s * Math.min(1.6 + s * 0.02, 3.0));

export default function NeonIcon({ name, size = 20, glow, className = '', style = {}, blendMode = 'normal' }) {
  const scaled = scaleSize(size);
  const glowFilter = glow
    ? `drop-shadow(0 0 ${Math.max(2, scaled * 0.05)}px ${glow}) drop-shadow(0 0 ${Math.max(6, scaled * 0.15)}px ${glow}) drop-shadow(0 0 ${Math.max(15, scaled * 0.35)}px ${glow}aa)`
    : `drop-shadow(0 0 ${Math.max(2, scaled * 0.04)}px rgba(255,255,255,0.9)) drop-shadow(0 0 ${Math.max(8, scaled * 0.16)}px rgba(255,255,255,0.4)) drop-shadow(0 0 ${Math.max(18, scaled * 0.32)}px rgba(255,255,255,0.2))`;

  const useBlend = blendMode !== 'normal';

  // When blendMode is used, we need it on an OUTER wrapper WITHOUT filter,
  // because CSS filter creates an isolated stacking context that blocks mix-blend-mode.
  const inner = (
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
        filter: `${glowFilter} contrast(${glow ? 1.3 : 1.05}) brightness(${glow ? 1.4 : 1.05})`,
        overflow: 'visible',
        background: 'transparent',
        ...(useBlend ? {} : style),
      }}
    >
      <div style={{
        width: '100%',
        height: '100%',
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
            filter: glow ? 'drop-shadow(0 0 2px rgba(255,255,255,0.7))' : 'none',
          }}
        />
      </div>
    </span>
  );

  if (!useBlend) return inner;

  // Outer wrapper: carries the blend mode WITHOUT filter (no isolation)
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        mixBlendMode: blendMode,
        ...style,
      }}
    >
      {inner}
    </span>
  );
}
