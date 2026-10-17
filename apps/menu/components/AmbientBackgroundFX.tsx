import React from 'react';

/**
 * AmbientBackgroundFX (§7 — layered, GPU-cheap)
 *
 * A single fixed, non-interactive stack that gives the menu its depth:
 *  1. Aurora   — three drifting silver light pools (transform-only animation)
 *  2. Waves    — seamless tiled SVG bands flowing behind the hero
 *  3. Grid     — masked engineer grid for technical texture
 *  4. Grain    — ~3% film grain to kill gradient banding
 *
 * Rendered as a server component: zero JS shipped to the client. All motion is
 * CSS-only and collapses under `prefers-reduced-motion`.
 */

/** One wave period. Kept in sync with the 1440px drift keyframe + tile offsets. */
const WAVE_PATH =
  'M0,210 C120,150 240,150 360,210 S600,270 720,210 S960,150 1080,210 S1320,270 1440,210';
const WAVE_FILL_PATH = `${WAVE_PATH} L1440,420 L0,420 Z`;

const TILE_OFFSETS = [0, 1440, 2880];

type WaveVariant = 'back' | 'mid' | 'front';

const WAVE_LAYERS: Array<{ variant: WaveVariant; dy: number; fill?: string }> = [
  { variant: 'back', dy: 34, fill: 'url(#padeWaveGradBack)' },
  { variant: 'mid', dy: 4 },
  { variant: 'front', dy: -30, fill: 'url(#padeWaveGradFront)' },
];

export function AmbientBackgroundFX() {
  return (
    <div className="pade-bg-fx pade-grain" aria-hidden="true">
      {/* 1. Aurora light pools */}
      <div className="pade-aurora">
        <span className="pade-aurora__blob pade-aurora__blob--a" />
        <span className="pade-aurora__blob pade-aurora__blob--b" />
        <span className="pade-aurora__blob pade-aurora__blob--c" />
      </div>

      {/* 2. Flowing wave bands */}
      <div className="pade-wave-stack">
        <svg viewBox="0 0 2880 420" preserveAspectRatio="none" focusable="false" role="presentation">
          <defs>
            <linearGradient id="padeWaveGradBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(208,211,217,0.00)" />
              <stop offset="55%" stopColor="rgba(208,211,217,0.05)" />
              <stop offset="100%" stopColor="rgba(208,211,217,0.10)" />
            </linearGradient>
            <linearGradient id="padeWaveGradFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.045)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
          </defs>

          {WAVE_LAYERS.map(({ variant, dy, fill }) => (
            <g key={variant} className={`pade-wave pade-wave--${variant}`}>
              <g transform={`translate(0 ${dy})`}>
                {TILE_OFFSETS.map((x) =>
                  variant === 'mid' ? (
                    <g key={x} transform={`translate(${x} 0)`}>
                      <path
                        d={WAVE_PATH}
                        fill="none"
                        stroke="rgba(208,211,217,0.07)"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                      />
                      <path
                        d={WAVE_PATH}
                        fill="none"
                        stroke="rgba(208,211,217,0.26)"
                        strokeWidth="1.25"
                        vectorEffect="non-scaling-stroke"
                      />
                    </g>
                  ) : (
                    <path key={x} d={WAVE_FILL_PATH} transform={`translate(${x} 0)`} fill={fill} />
                  )
                )}
              </g>
            </g>
          ))}
        </svg>
      </div>

      {/* 3. Engineer grid */}
      <div className="pade-grid-overlay" />
    </div>
  );
}
