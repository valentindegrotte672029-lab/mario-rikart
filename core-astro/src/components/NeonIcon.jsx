import React from 'react';

const ICON_V = '23';
// Progressive scaling: small inline icons stay readable, large display icons get much bigger
const scaleSize = (s) => Math.round(s * Math.min(1.6 + s * 0.02, 3.0));

export default function NeonIcon({ name, size = 20, glow, className = '', style = {}, blendMode = 'normal' }) {
  const scaled = scaleSize(size);
  const glowFilter = glow
    ? `drop-shadow(0 0 ${Math.max(1, scaled * 0.03)}px ${glow}) drop-shadow(0 0 ${Math.max(3, scaled * 0.08)}px ${glow}) drop-shadow(0 0 ${Math.max(8, scaled * 0.15)}px ${glow}88)`
    : `drop-shadow(0 0 ${Math.max(1, scaled * 0.02)}px rgba(255,255,255,0.8)) drop-shadow(0 0 ${Math.max(4, scaled * 0.08)}px rgba(255,255,255,0.3)) drop-shadow(0 0 ${Math.max(10, scaled * 0.15)}px rgba(255,255,255,0.1))`;

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
        filter: `${glowFilter} contrast(${glow ? 1.15 : 1.02}) brightness(${glow ? 1.2 : 1.02})`,
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
