import React from 'react';
import {Lock, RotateCw} from 'lucide-react';
import {BODY} from '../theme';

// Phone screens are designed at a 390x844 logical size (iPhone-ish) and scaled to fit.
export const PHONE_W = 390;
export const PHONE_H = 844;
const INSET = 0.035; // bezel as a fraction of the phone width
export const phoneHeight = (w: number) => w * (1 - 2 * INSET) * (PHONE_H / PHONE_W) + 2 * w * INSET;

const bodyStyle = (w: number, h: number): React.CSSProperties => ({
  position: 'absolute', left: 0, top: 0, width: w, height: h, borderRadius: w * 0.15,
  background: 'linear-gradient(145deg, #2A2E37 0%, #121419 45%, #1B1E25 100%)',
  boxShadow: `0 ${w * 0.08}px ${w * 0.22}px rgba(0,0,0,0.45), inset 0 0 0 ${Math.max(2, w * 0.004)}px rgba(255,255,255,0.14), inset 0 0 0 ${w * 0.012}px #07080A`,
});

// Scales 390-wide logical content into a screen of pixel width `w`.
export const Logical: React.FC<{w: number; lw?: number; lh: number; children: React.ReactNode}> = ({w, lw = PHONE_W, lh, children}) => (
  <div style={{width: lw, height: lh, transform: `scale(${w / lw})`, transformOrigin: '0 0', position: 'relative'}}>{children}</div>
);

export const Island: React.FC<{w: number}> = ({w}) => (
  <div
    style={{
      position: 'absolute', top: w * 0.045, left: '50%', width: w * 0.29, height: w * 0.083, marginLeft: -w * 0.145,
      borderRadius: 999, background: '#000', zIndex: 5,
    }}
  />
);

// A flat phone: body + one screen.
export const Phone: React.FC<{width: number; screenBg?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({
  width, screenBg = '#000', children, style,
}) => {
  const h = phoneHeight(width);
  const sw = width * (1 - 2 * INSET);
  return (
    <div style={{position: 'relative', width, height: h, ...style}}>
      <div style={bodyStyle(width, h)} />
      <div
        style={{
          position: 'absolute', left: width * INSET, top: width * INSET, width: sw, height: h - 2 * width * INSET,
          borderRadius: width * 0.12, overflow: 'hidden', background: screenBg,
        }}
      >
        <Logical w={sw} lh={PHONE_H}>{children}</Logical>
      </div>
      <Island w={width} />
    </div>
  );
};

export type Layer = {key: string; z: number; opacity?: number; node: React.ReactNode; bg?: string; shadow?: string};

// A phone whose screen is a stack of layers that can separate in 3D: the "look beneath
// the website" moment. rx/rz rotate the whole device; each layer sits at its own z.
export const PhoneStack: React.FC<{
  width: number;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  bodyOpacity?: number;
  islandOpacity?: number;
  layers: Layer[];
  perspective?: number;
}> = ({width, rx = 0, ry = 0, rz = 0, scale = 1, bodyOpacity = 1, islandOpacity = 1, layers, perspective = 3000}) => {
  const h = phoneHeight(width);
  const sw = width * (1 - 2 * INSET);
  const sh = h - 2 * width * INSET;
  return (
    <div style={{position: 'relative', width, height: h, perspective, perspectiveOrigin: '50% 45%'}}>
      <div
        style={{
          position: 'absolute', inset: 0, transformStyle: 'preserve-3d',
          transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
        }}
      >
        <div style={{...bodyStyle(width, h), opacity: bodyOpacity, transform: 'translateZ(-14px)'}} />
        {layers.map((l) => (
          <div
            key={l.key}
            style={{
              position: 'absolute', left: width * INSET, top: width * INSET, width: sw, height: sh,
              borderRadius: width * 0.12, overflow: 'hidden', background: l.bg,
              opacity: l.opacity ?? 1, transform: `translateZ(${l.z}px)`,
              boxShadow: l.shadow,
            }}
          >
            <Logical w={sw} lh={PHONE_H}>{l.node}</Logical>
          </div>
        ))}
        <div style={{position: 'absolute', inset: 0, transform: `translateZ(${Math.max(...layers.map((l) => l.z)) + 1}px)`, opacity: islandOpacity}}>
          <Island w={width} />
        </div>
      </div>
    </div>
  );
};

// Desktop browser window. Content is designed at 1280 logical px wide.
export const DESK_W = 1280;
const BAR = 54;

export const BrowserChrome: React.FC<{width: number; url: string; dark?: boolean}> = ({width, url, dark = true}) => {
  const k = width / DESK_W;
  const fg = dark ? 'rgba(255,255,255,0.75)' : 'rgba(20,20,30,0.7)';
  return (
    <div
      style={{
        height: BAR * k, display: 'flex', alignItems: 'center', padding: `0 ${18 * k}px`, gap: 10 * k,
        background: dark ? '#16181E' : '#ECEBE8', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
      }}
    >
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 13 * k, height: 13 * k, borderRadius: 99, background: c}} />
      ))}
      <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8 * k, padding: `${7 * k}px ${18 * k}px`, minWidth: 420 * k, justifyContent: 'center',
            borderRadius: 10 * k, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.9)',
            fontFamily: BODY, fontSize: 15 * k, fontWeight: 500, color: fg,
          }}
        >
          <Lock size={13 * k} strokeWidth={2.4} />
          {url}
        </div>
      </div>
      <RotateCw size={15 * k} color={fg} />
    </div>
  );
};

export const browserHeight = (width: number, logicalH: number) => ((BAR + logicalH) * width) / DESK_W;

// Flat browser window with 1280-wide logical content.
export const Browser: React.FC<{width: number; lh: number; url: string; dark?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({
  width, lh, url, dark = true, children, style,
}) => {
  const k = width / DESK_W;
  return (
    <div
      style={{
        width, height: browserHeight(width, lh), borderRadius: 16 * k, overflow: 'hidden',
        background: dark ? '#0B0C10' : '#fff',
        boxShadow: `0 ${40 * k}px ${120 * k}px rgba(0,0,0,0.45), 0 0 0 1px ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        ...style,
      }}
    >
      <BrowserChrome width={width} url={url} dark={dark} />
      <div style={{position: 'relative', width, height: lh * k, overflow: 'hidden'}}>
        <Logical w={width} lw={DESK_W} lh={lh}>{children}</Logical>
      </div>
    </div>
  );
};

// Browser window whose page area is a stack of separable layers (desktop "beneath" shot).
export const BrowserStack: React.FC<{
  width: number;
  lh: number;
  url: string;
  rx?: number;
  ry?: number;
  rz?: number;
  scale?: number;
  chromeOpacity?: number;
  layers: Layer[];
  perspective?: number;
}> = ({width, lh, url, rx = 0, ry = 0, rz = 0, scale = 1, chromeOpacity = 1, layers, perspective = 3600}) => {
  const k = width / DESK_W;
  const h = browserHeight(width, lh);
  return (
    <div style={{position: 'relative', width, height: h, perspective, perspectiveOrigin: '50% 40%'}}>
      <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`}}>
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 16 * k, overflow: 'hidden', background: '#0B0C10', opacity: chromeOpacity,
            boxShadow: `0 ${40 * k}px ${120 * k}px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.1)`, transform: 'translateZ(-12px)',
          }}
        >
          <BrowserChrome width={width} url={url} />
        </div>
        {layers.map((l) => (
          <div
            key={l.key}
            style={{
              position: 'absolute', left: 0, top: BAR * k, width, height: lh * k, overflow: 'hidden', background: l.bg,
              borderRadius: `0 0 ${16 * k}px ${16 * k}px`, opacity: l.opacity ?? 1, transform: `translateZ(${l.z}px)`, boxShadow: l.shadow,
            }}
          >
            <Logical w={width} lw={DESK_W} lh={lh}>{l.node}</Logical>
          </div>
        ))}
      </div>
    </div>
  );
};
