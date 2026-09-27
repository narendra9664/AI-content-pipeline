import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BatteryFull, Clock3, Download, Eye, FileText, LucideIcon, Menu, MessageCircle, MousePointerClick, Repeat, Signal, Tag, Wifi} from 'lucide-react';
import {BODY, CLAMP, Theme, alpha} from '../theme';

// A fictional luxury developer site ("VELORIA Sky Residences") used as "your website"
// in every video, plus the tracking layer that sits beneath it.

const SERIF = 'Instrument Serif';
const TOWER = 'series/img/tower.jpg';
const IMG_W = 2048;
const IMG_H = 1152;

export type SiteVariant = 'dark' | 'light';
const SITE = {
  dark: {bg: '#0D0E11', text: '#F3EEE6', muted: 'rgba(243,238,230,0.62)', gold: '#C8A46A', card: '#16181D', line: 'rgba(255,255,255,0.10)', onGold: '#15120C'},
  light: {bg: '#F6F3EE', text: '#15171B', muted: 'rgba(21,23,27,0.60)', gold: '#9A7542', card: '#FFFFFF', line: 'rgba(0,0,0,0.09)', onGold: '#FFFFFF'},
};

// Tower photo crop: zoom about a focal point given as fractions of the image.
export const Photo: React.FC<{w: number; h: number; zoom?: number; fx?: number; fy?: number; radius?: number; style?: React.CSSProperties}> = ({
  w, h, zoom = 1, fx = 0.5, fy = 0.5, radius = 0, style,
}) => {
  const s = Math.max(w / IMG_W, h / IMG_H) * zoom;
  const iw = IMG_W * s;
  const ih = IMG_H * s;
  const left = Math.min(0, Math.max(w - iw, w / 2 - fx * iw));
  const top = Math.min(0, Math.max(h - ih, h / 2 - fy * ih));
  return (
    <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', borderRadius: radius, flexShrink: 0, ...style}}>
      <Img src={staticFile(TOWER)} style={{position: 'absolute', left, top, width: iw, height: ih}} />
    </div>
  );
};

export type Box = {x: number; y: number; w: number; h: number};
const center = (b: Box) => ({x: b.x + b.w / 2, y: b.y + b.h / 2});

const UNITS = [
  {id: 'ph42a', label: 'PENTHOUSE · 42A', title: 'The Sky Penthouse', spec: '4 bed · 3,210 sq ft', note: 'Private terrace', fx: 0.5, fy: 0.3},
  {id: 'sv38c', label: 'SKY VILLA · 38C', title: 'Sky Villa', spec: '3 bed · 2,480 sq ft', note: 'Corner balcony', fx: 0.41, fy: 0.55},
  {id: 'r21b', label: 'RESIDENCE · 21B', title: 'Residence 21B', spec: '2 bed · 1,460 sq ft', note: 'City views', fx: 0.6, fy: 0.82},
];

// ---------------------------------------------------------------- mobile (390 x 844)

export const M: Record<string, Box> = {
  hero: {x: 0, y: 0, w: 390, h: 540},
  headline: {x: 22, y: 346, w: 300, h: 100},
  book: {x: 22, y: 486, w: 142, h: 40},
  plans: {x: 174, y: 486, w: 118, h: 40},
  ph42a: {x: 22, y: 624, w: 346, h: 168},
  sv38c: {x: 22, y: 808, w: 346, h: 168},
  r21b: {x: 22, y: 992, w: 346, h: 168},
  floorplan: {x: 22, y: 1236, w: 346, h: 190},
  pricing: {x: 22, y: 1490, w: 346, h: 120},
  enquire: {x: 22, y: 772, w: 346, h: 50}, // sticky (viewport coords)
};

export const StatusBar: React.FC<{color: string; time?: string}> = ({color, time = '9:41'}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 30px 0 34px', color, zIndex: 4}}>
    <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 15.5, letterSpacing: '-0.01em'}}>{time}</div>
    <div style={{display: 'flex', gap: 6, alignItems: 'center'}}>
      <Signal size={16} strokeWidth={2.6} />
      <Wifi size={16} strokeWidth={2.6} />
      <BatteryFull size={22} strokeWidth={2} />
    </div>
  </div>
);

const Btn: React.FC<{b: Box; filled?: boolean; c: typeof SITE.dark; children: React.ReactNode; size?: number}> = ({b, filled, c, children, size = 12.5}) => (
  <div
    style={{
      position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      background: filled ? c.gold : 'transparent', border: filled ? 'none' : `1px solid ${c.text}55`,
      color: filled ? c.onGold : c.text, fontFamily: BODY, fontWeight: 600, fontSize: size, letterSpacing: '0.01em',
    }}
  >
    {children}
  </div>
);

const FloorPlanArt: React.FC<{w: number; h: number; color: string}> = ({w, h, color}) => (
  <svg width={w} height={h} viewBox="0 0 160 110" fill="none" stroke={color} strokeWidth={1.6}>
    <rect x="4" y="4" width="152" height="102" rx="2" />
    <path d="M60 4 V58 M60 76 V106 M4 58 H44 M60 58 H100 M100 4 V40 M100 58 V106 M118 58 H156 M100 40 H156" />
    <path d="M44 58 A16 16 0 0 1 60 42" strokeDasharray="2 2" />
    <rect x="12" y="66" width="36" height="30" rx="2" strokeOpacity="0.5" />
    <rect x="110" y="70" width="36" height="26" rx="4" strokeOpacity="0.5" />
  </svg>
);

const UnitCard: React.FC<{b: Box; u: (typeof UNITS)[number]; c: typeof SITE.dark; glow?: number}> = ({b, u, c, glow = 0}) => (
  <div
    style={{
      position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 18, background: c.card,
      border: `1px solid ${glow > 0 ? alpha(c.gold, 0.5 + glow * 0.5) : c.line}`, display: 'flex', gap: 14, padding: 10,
      boxShadow: glow > 0 ? `0 0 ${30 * glow}px ${alpha(c.gold, 0.45 * glow)}` : undefined,
    }}
  >
    <Photo w={132} h={148} zoom={3.1} fx={u.fx} fy={u.fy} radius={12} />
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, fontFamily: BODY}}>
      <div style={{fontSize: 10.5, fontWeight: 600, letterSpacing: '0.18em', color: c.gold}}>{u.label}</div>
      <div style={{fontFamily: SERIF, fontSize: 25, lineHeight: 1, color: c.text}}>{u.title}</div>
      <div style={{fontSize: 12.5, color: c.muted}}>{u.spec}</div>
      <div style={{fontSize: 12.5, fontWeight: 600, color: c.gold, marginTop: 4}}>View residence →</div>
    </div>
  </div>
);

export const SiteMobile: React.FC<{
  variant?: SiteVariant;
  scroll?: number;
  glow?: Partial<Record<string, number>>;
  time?: string;
}> = ({variant = 'dark', scroll = 0, glow = {}, time}) => {
  const c = SITE[variant];
  return (
    <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', fontFamily: BODY}}>
      <div style={{position: 'absolute', left: 0, top: -scroll, width: 390, height: 2000}}>
        <Photo w={390} h={540} zoom={1.55} fx={0.5} fy={0.42} style={{position: 'absolute', left: 0, top: 0}} />
        <div style={{position: 'absolute', left: 0, top: 0, width: 390, height: 540, background: `linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 45%, ${c.bg} 100%)`}} />
        <div style={{position: 'absolute', left: 22, top: 58, right: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff'}}>
          <div style={{fontWeight: 600, fontSize: 14, letterSpacing: '0.42em'}}>VELORIA</div>
          <Menu size={22} />
        </div>
        <div style={{position: 'absolute', left: 22, top: 318, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.22em', color: c.gold}}>SKY RESIDENCES · NOW SELLING</div>
        <div style={{position: 'absolute', left: 22, top: M.headline.y, fontFamily: SERIF, fontSize: 52, lineHeight: 0.95, color: c.text}}>
          Live above
          <br />
          <span style={{fontStyle: 'italic'}}>it all.</span>
        </div>
        <div style={{position: 'absolute', left: 22, top: 452, fontSize: 13, color: c.muted}}>Residences & penthouses, floors 20 to 44.</div>
        <Btn b={M.book} filled c={c}>Book a viewing</Btn>
        <Btn b={M.plans} c={c}>Floor plans</Btn>

        <div style={{position: 'absolute', left: 22, right: 22, top: 574, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
          <div style={{fontFamily: SERIF, fontSize: 32, color: c.text}}>Residences</div>
          <div style={{fontSize: 12.5, fontWeight: 600, color: c.gold}}>View all</div>
        </div>
        {UNITS.map((u) => (
          <UnitCard key={u.id} b={M[u.id]} u={u} c={c} glow={glow[u.id] ?? 0} />
        ))}

        <div style={{position: 'absolute', left: 22, top: 1186, fontFamily: SERIF, fontSize: 32, color: c.text}}>Floor plans</div>
        <div
          style={{
            position: 'absolute', left: M.floorplan.x, top: M.floorplan.y, width: M.floorplan.w, height: M.floorplan.h, borderRadius: 18,
            background: c.card, border: `1px solid ${glow.floorplan ? alpha(c.gold, 0.9) : c.line}`, padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
            boxShadow: glow.floorplan ? `0 0 ${30 * glow.floorplan}px ${alpha(c.gold, 0.45 * glow.floorplan)}` : undefined,
          }}
        >
          <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
            <FloorPlanArt w={150} h={104} color={c.muted} />
            <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
              <div style={{fontFamily: SERIF, fontSize: 22, color: c.text}}>Penthouse 42A</div>
              <div style={{fontSize: 12, color: c.muted}}>Full layout · 3,210 sq ft</div>
            </div>
          </div>
          <div style={{height: 40, borderRadius: 999, background: c.gold, color: c.onGold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 13}}>
            <Download size={15} strokeWidth={2.4} /> Download floor plans (PDF)
          </div>
        </div>

        <div style={{position: 'absolute', left: 22, top: 1446, fontFamily: SERIF, fontSize: 32, color: c.text}}>Pricing</div>
        <div
          style={{
            position: 'absolute', left: M.pricing.x, top: M.pricing.y, width: M.pricing.w, height: M.pricing.h, borderRadius: 18, background: c.card,
            border: `1px solid ${glow.pricing ? alpha(c.gold, 0.9) : c.line}`, padding: 16, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}
        >
          <div style={{fontSize: 13, color: c.muted}}>Price list & payment plans, sent privately.</div>
          <div style={{height: 40, borderRadius: 999, border: `1px solid ${c.gold}`, color: c.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 13}}>
            <FileText size={15} strokeWidth={2.4} /> Request price list
          </div>
        </div>

        <div style={{position: 'absolute', left: 22, top: 1646, fontFamily: SERIF, fontSize: 32, color: c.text}}>Sales gallery</div>
        <Photo w={346} h={150} zoom={2.2} fx={0.5} fy={0.7} radius={18} style={{position: 'absolute', left: 22, top: 1696}} />
        <div style={{position: 'absolute', left: 22, top: 1862, width: 346, fontSize: 13, lineHeight: 1.5, color: c.muted}}>
          Private appointments daily, 10 am to 7 pm.
          <br />
          Complimentary valet for registered buyers.
        </div>
        <div style={{position: 'absolute', left: 22, right: 22, top: 1936, height: 1, background: c.line}} />
        <div style={{position: 'absolute', left: 22, top: 1956, fontWeight: 600, fontSize: 13, letterSpacing: '0.42em', color: c.text}}>VELORIA</div>
      </div>

      {/* sticky header once the hero has scrolled away */}
      <div
        style={{
          position: 'absolute', left: 0, top: 0, width: 390, height: 104, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 22px 14px',
          background: variant === 'dark' ? 'rgba(13,14,17,0.94)' : 'rgba(246,243,238,0.95)', borderBottom: `1px solid ${c.line}`, color: c.text,
          opacity: interpolate(scroll, [380, 460], [0, 1], CLAMP),
        }}
      >
        <div style={{fontWeight: 600, fontSize: 14, letterSpacing: '0.42em'}}>VELORIA</div>
        <Menu size={22} />
      </div>

      <div
        style={{
          position: 'absolute', left: M.enquire.x, top: M.enquire.y, width: M.enquire.w, height: M.enquire.h, borderRadius: 999,
          background: variant === 'dark' ? 'rgba(24,26,31,0.92)' : 'rgba(255,255,255,0.94)', border: `1px solid ${c.line}`,
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px 0 20px',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: c.text}}>
          <MessageCircle size={17} /> Questions? Chat with us
        </div>
        <div style={{height: 38, padding: '0 16px', borderRadius: 999, background: c.gold, color: c.onGold, display: 'flex', alignItems: 'center', fontSize: 12.5, fontWeight: 700}}>Enquire</div>
      </div>
      <StatusBar color={scroll > 420 ? c.text : '#fff'} time={time} />
      <div style={{position: 'absolute', bottom: 8, left: 128, width: 134, height: 5, borderRadius: 9, background: variant === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}} />
    </div>
  );
};

// ---------------------------------------------------------------- the layer beneath

type IconName = 'eye' | 'download' | 'clock' | 'tap' | 'price' | 'repeat';
const ICONS: Record<IconName, LucideIcon> = {
  eye: Eye, download: Download, clock: Clock3, tap: MousePointerClick, price: Tag, repeat: Repeat,
};

export type XTag = {id: string; text: string; icon: IconName; at: number; dx?: number; dy?: number; hot?: boolean; count?: {from: number; to: number; every: number}};

const TagPill: React.FC<{t: XTag; theme: Theme; boxes: Record<string, Box>; scroll: number; size: number}> = ({t, theme, boxes, scroll, size}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - t.at, fps, config: {damping: 14, stiffness: 150, mass: 0.6}});
  if (frame < t.at) return null;
  const b = boxes[t.id];
  const Icon = ICONS[t.icon];
  const col = t.hot ? theme.hot : theme.accent;
  const n = t.count ? Math.min(t.count.to, t.count.from + Math.floor(Math.max(0, frame - t.at) / t.count.every)) : 0;
  const bump = t.count ? interpolate((Math.max(0, frame - t.at) % t.count.every), [0, 5], [1.18, 1], CLAMP) : 1;
  return (
    <div
      style={{
        position: 'absolute', left: b.x + (t.dx ?? 12), top: b.y - scroll + (t.dy ?? 12), transformOrigin: '0 50%',
        transform: `scale(${0.6 + p * 0.4})`, opacity: Math.min(1, p * 1.5),
        display: 'flex', alignItems: 'center', gap: size * 0.45, padding: `${size * 0.42}px ${size * 0.8}px`, borderRadius: 999,
        background: alpha(theme.mode === 'dark' ? '#000000' : '#FFFFFF', 0.72), border: `1px solid ${alpha(col, 0.8)}`,
        boxShadow: `0 0 ${size * 1.4}px ${alpha(col, 0.35)}`, color: theme.text,
        fontFamily: BODY, fontWeight: 700, fontSize: size, whiteSpace: 'nowrap',
      }}
    >
      <span style={{color: col, display: 'flex'}}>
        <Icon size={size * 1.15} strokeWidth={2.4} />
      </span>
      {t.text}
      {t.count ? <span style={{color: col, display: 'inline-block', transform: `scale(${bump})`}}>×{n}</span> : null}
    </div>
  );
};

const Outline: React.FC<{b: Box; scroll: number; theme: Theme; label?: string; strong?: number; radius?: number}> = ({b, scroll, theme, label, strong = 0, radius = 14}) => (
  <div
    style={{
      position: 'absolute', left: b.x, top: b.y - scroll, width: b.w, height: b.h, borderRadius: radius,
      border: `1.5px dashed ${alpha(theme.accent, 0.35 + strong * 0.65)}`,
      background: alpha(theme.accent, 0.04 + strong * 0.1),
    }}
  >
    {label ? (
      <div style={{position: 'absolute', left: 10, bottom: 8, fontFamily: 'monospace', fontSize: 10.5, color: alpha(theme.accent, 0.8), letterSpacing: '0.04em'}}>{label}</div>
    ) : null}
  </div>
);

const Heat: React.FC<{x: number; y: number; r: number; color: string; amount: number}> = ({x, y, r, color, amount}) => (
  <div
    style={{
      position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
      background: `radial-gradient(circle, ${alpha(color, 0.75 * amount)} 0%, ${alpha(color, 0.3 * amount)} 35%, rgba(0,0,0,0) 70%)`,
    }}
  />
);

export const xrayBg = (theme: Theme) => (theme.mode === 'dark' ? theme.surface : theme.surface);

// Data view of the same page: outlines of every element, heat where attention went,
// live tags for what the visitor did.
export const XRay: React.FC<{
  theme: Theme;
  boxes: Record<string, Box>;
  outlines: {id: string; label?: string}[];
  w: number;
  h: number;
  scroll?: number;
  tags?: XTag[];
  heat?: {id: string; at: number; r?: number}[];
  strong?: Partial<Record<string, number>>;
  rail?: {at: number; to: number}; // scroll-depth rail
  header?: {text: string; at: number};
  tagSize?: number;
  gridSize?: number;
}> = ({theme, boxes, outlines, w, h, scroll = 0, tags = [], heat = [], strong = {}, rail, header, tagSize = 12.5, gridSize = 26}) => {
  const frame = useCurrentFrame();
  const railP = rail ? interpolate(frame, [rail.at, rail.at + 45], [0, rail.to], CLAMP) : 0;
  const headP = header ? interpolate(frame, [header.at, header.at + 10], [0, 1], CLAMP) : 0;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 5);
  return (
    <div style={{position: 'absolute', inset: 0, background: xrayBg(theme), overflow: 'hidden', fontFamily: BODY}}>
      <div
        style={{
          position: 'absolute', inset: 0, opacity: 0.8,
          backgroundImage: `linear-gradient(${theme.line} 1px, transparent 1px), linear-gradient(90deg, ${theme.line} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`, backgroundPosition: `0 ${-scroll % gridSize}px`,
        }}
      />
      {heat.map((ht) => {
        const b = boxes[ht.id];
        const c = center(b);
        const a = interpolate(frame, [ht.at, ht.at + 20], [0, 1], CLAMP) * (0.85 + 0.15 * pulse);
        return <Heat key={ht.id} x={c.x} y={c.y - scroll} r={ht.r ?? Math.max(b.w, b.h) * 0.62} color={theme.hot} amount={a} />;
      })}
      {outlines.map((o) => (
        <Outline key={o.id} b={boxes[o.id]} scroll={scroll} theme={theme} label={o.label} strong={strong[o.id] ?? 0} radius={o.id === 'book' || o.id === 'plans' || o.id === 'enquire' ? 999 : 14} />
      ))}
      {header ? (
        <div
          style={{
            position: 'absolute', top: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: headP, transform: `translateY(${(1 - headP) * -10}px)`,
          }}
        >
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: `${tagSize * 0.45}px ${tagSize}px`, borderRadius: 999,
              background: alpha(theme.accent, 0.14), border: `1px solid ${alpha(theme.accent, 0.6)}`, color: theme.text, fontWeight: 700, fontSize: tagSize,
            }}
          >
            <div style={{width: tagSize * 0.6, height: tagSize * 0.6, borderRadius: 9, background: theme.good, boxShadow: `0 0 ${6 + pulse * 8}px ${theme.good}`}} />
            {header.text}
          </div>
        </div>
      ) : null}
      {rail ? (
        <div style={{position: 'absolute', right: 8, top: 110, bottom: 110, width: 4, borderRadius: 4, background: alpha(theme.accent, 0.18)}}>
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: `${railP * 100}%`, borderRadius: 4, background: theme.accent, boxShadow: `0 0 10px ${theme.accent}`}} />
          <div
            style={{
              position: 'absolute', right: 10, top: `calc(${railP * 100}% - 12px)`, padding: '3px 8px', borderRadius: 8, background: theme.accent, color: theme.onAccent,
              fontWeight: 800, fontSize: tagSize * 0.9, whiteSpace: 'nowrap', opacity: railP > 0 ? 1 : 0,
            }}
          >
            {Math.round(railP * 100)}%
          </div>
        </div>
      ) : null}
      {tags.map((t, i) => (
        <TagPill key={i} t={t} theme={theme} boxes={boxes} scroll={scroll} size={tagSize} />
      ))}
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, pointerEvents: 'none'}} />
    </div>
  );
};

export const MOBILE_OUTLINES = [
  {id: 'hero', label: 'hero · viewed'},
  {id: 'book'},
  {id: 'plans'},
  {id: 'ph42a', label: 'unit/penthouse-42a'},
  {id: 'sv38c', label: 'unit/sky-villa-38c'},
  {id: 'r21b', label: 'unit/residence-21b'},
  {id: 'floorplan', label: 'download/floor-plans.pdf'},
  {id: 'pricing', label: 'form/price-list'},
];

// Glowing points that sit between the site and the data layer in the 3D stack.
export const Signals: React.FC<{theme: Theme; boxes: Record<string, Box>; ids: string[]; scroll?: number; at?: number}> = ({theme, boxes, ids, scroll = 0, at = 0}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {ids.map((id, i) => {
        const c = center(boxes[id]);
        const t = frame - at - i * 4;
        const y = c.y - scroll;
        const a = interpolate(t, [0, 10], [0, 1], CLAMP) * interpolate(y, [70, 130, 720, 790], [0, 1, 1, 0], CLAMP);
        const ring = ((t % 40) + 40) % 40 / 40;
        return (
          <div key={id} style={{position: 'absolute', left: c.x - 40, top: c.y - scroll - 40, width: 80, height: 80, opacity: a}}>
            <div style={{position: 'absolute', left: 30, top: 30, width: 20, height: 20, borderRadius: 20, background: theme.accent2, boxShadow: `0 0 24px 6px ${alpha(theme.accent2, 0.8)}`}} />
            <div
              style={{
                position: 'absolute', left: 40 - 40 * ring, top: 40 - 40 * ring, width: 80 * ring, height: 80 * ring, borderRadius: '50%',
                border: `2px solid ${alpha(theme.accent2, 1 - ring)}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- desktop (1280 x 760)

export const D: Record<string, Box> = {
  hero: {x: 0, y: 76, w: 1280, h: 470},
  headline: {x: 64, y: 196, w: 540, h: 180},
  book: {x: 64, y: 448, w: 176, h: 50},
  plans: {x: 256, y: 448, w: 150, h: 50},
  image: {x: 660, y: 100, w: 560, h: 420},
  ph42a: {x: 64, y: 572, w: 368, h: 164},
  sv38c: {x: 456, y: 572, w: 368, h: 164},
  r21b: {x: 848, y: 572, w: 368, h: 164},
  navBook: {x: 1062, y: 16, w: 154, h: 44},
  floorplan: {x: 64, y: 820, w: 560, h: 220},
  pricing: {x: 656, y: 820, w: 560, h: 220},
};

const DeskUnit: React.FC<{b: Box; u: (typeof UNITS)[number]; c: typeof SITE.dark; glow?: number}> = ({b, u, c, glow = 0}) => (
  <div
    style={{
      position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: 18, background: c.card,
      border: `1px solid ${glow > 0 ? alpha(c.gold, 0.5 + glow * 0.5) : c.line}`, display: 'flex', gap: 16, padding: 10,
      boxShadow: glow > 0 ? `0 0 ${34 * glow}px ${alpha(c.gold, 0.45 * glow)}` : undefined,
    }}
  >
    <Photo w={130} h={144} zoom={3.1} fx={u.fx} fy={u.fy} radius={12} />
    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 7, fontFamily: BODY}}>
      <div style={{fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: c.gold}}>{u.label}</div>
      <div style={{fontFamily: SERIF, fontSize: 27, lineHeight: 1, color: c.text}}>{u.title}</div>
      <div style={{fontSize: 13.5, color: c.muted}}>{u.spec}</div>
      <div style={{fontSize: 13.5, fontWeight: 600, color: c.gold, marginTop: 2}}>View residence →</div>
    </div>
  </div>
);

export const SiteDesktop: React.FC<{variant?: SiteVariant; scroll?: number; glow?: Partial<Record<string, number>>}> = ({variant = 'dark', scroll = 0, glow = {}}) => {
  const c = SITE[variant];
  return (
    <div style={{position: 'absolute', inset: 0, background: c.bg, overflow: 'hidden', fontFamily: BODY}}>
      <div style={{position: 'absolute', left: 0, top: -scroll, width: 1280, height: 1100}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1280, height: 76, display: 'flex', alignItems: 'center', padding: '0 64px', justifyContent: 'space-between', borderBottom: `1px solid ${c.line}`}}>
          <div style={{fontWeight: 600, fontSize: 16, letterSpacing: '0.42em', color: c.text}}>VELORIA</div>
          <div style={{display: 'flex', gap: 34, fontSize: 14.5, color: c.muted, fontWeight: 500, marginRight: 70}}>
            <span>Residences</span>
            <span>Amenities</span>
            <span>Floor plans</span>
            <span>Location</span>
          </div>
          <div style={{width: 1}} />
        </div>
        <Btn b={D.navBook} filled c={c} size={14}>Book a viewing</Btn>
        <div style={{position: 'absolute', left: 64, top: 164, fontSize: 12, fontWeight: 600, letterSpacing: '0.24em', color: c.gold}}>SKY RESIDENCES · NOW SELLING</div>
        <div style={{position: 'absolute', left: 64, top: D.headline.y, fontFamily: SERIF, fontSize: 92, lineHeight: 0.95, color: c.text}}>
          Live above
          <br />
          <span style={{fontStyle: 'italic'}}>it all.</span>
        </div>
        <div style={{position: 'absolute', left: 64, top: 392, width: 480, fontSize: 16, lineHeight: 1.5, color: c.muted}}>
          Residences & penthouses from the 20th to the 44th floor, with a private garden on the roof.
        </div>
        <Btn b={D.book} filled c={c} size={15}>Book a private viewing</Btn>
        <Btn b={D.plans} c={c} size={15}>Floor plans</Btn>
        <Photo w={D.image.w} h={D.image.h} zoom={1.25} fx={0.5} fy={0.45} radius={22} style={{position: 'absolute', left: D.image.x, top: D.image.y}} />
        {UNITS.map((u) => (
          <DeskUnit key={u.id} b={D[u.id]} u={u} c={c} glow={glow[u.id] ?? 0} />
        ))}
        <div style={{position: 'absolute', left: 64, top: 772, fontFamily: SERIF, fontSize: 36, color: c.text}}>Floor plans & pricing</div>
        <div
          style={{
            position: 'absolute', left: D.floorplan.x, top: D.floorplan.y, width: D.floorplan.w, height: D.floorplan.h, borderRadius: 18, background: c.card,
            border: `1px solid ${glow.floorplan ? alpha(c.gold, 0.9) : c.line}`, display: 'flex', alignItems: 'center', gap: 28, padding: 24,
            boxShadow: glow.floorplan ? `0 0 ${30 * glow.floorplan}px ${alpha(c.gold, 0.45 * glow.floorplan)}` : undefined,
          }}
        >
          <FloorPlanArt w={220} h={152} color={c.muted} />
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            <div style={{fontFamily: SERIF, fontSize: 28, color: c.text}}>Penthouse 42A</div>
            <div style={{fontSize: 14, color: c.muted}}>Full layout · 3,210 sq ft</div>
            <div style={{marginTop: 8, height: 44, padding: '0 20px', borderRadius: 999, background: c.gold, color: c.onGold, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14}}>
              <Download size={16} strokeWidth={2.4} /> Download PDF
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute', left: D.pricing.x, top: D.pricing.y, width: D.pricing.w, height: D.pricing.h, borderRadius: 18, background: c.card,
            border: `1px solid ${glow.pricing ? alpha(c.gold, 0.9) : c.line}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, padding: 32,
          }}
        >
          <div style={{fontFamily: SERIF, fontSize: 28, color: c.text}}>Price list & payment plans</div>
          <div style={{fontSize: 14, color: c.muted}}>Sent privately to registered buyers.</div>
          <div style={{alignSelf: 'flex-start', height: 44, padding: '0 20px', borderRadius: 999, border: `1px solid ${c.gold}`, color: c.gold, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14}}>
            <FileText size={16} strokeWidth={2.4} /> Request price list
          </div>
        </div>
      </div>
    </div>
  );
};

export const DESKTOP_OUTLINES = [
  {id: 'headline', label: 'hero · read'},
  {id: 'image', label: 'gallery · 14 photos viewed'},
  {id: 'book'},
  {id: 'plans'},
  {id: 'navBook'},
  {id: 'ph42a', label: 'unit/penthouse-42a'},
  {id: 'sv38c', label: 'unit/sky-villa-38c'},
  {id: 'r21b', label: 'unit/residence-21b'},
  {id: 'floorplan', label: 'download/floor-plans.pdf'},
  {id: 'pricing', label: 'form/price-list'},
];
