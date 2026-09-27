// Palettes for the explainer series. Each video gets its own look; the website hero
// ("brand") matches the site.
export type Theme = {
  id: string;
  mode: 'dark' | 'light';
  bg: string;
  blobs: [string, string, string];
  grid: boolean;
  surface: string;
  surface2: string;
  line: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  hot: string;
  good: string;
  bad: string;
  onAccent: string;
  display: string;
  displayWeight: number;
  displayTracking: string;
};

const INTER = 'Inter';

export const THEMES = {
  midnight: {
    id: 'midnight', mode: 'dark', bg: '#050814',
    blobs: ['rgba(47,107,255,0.55)', 'rgba(34,211,238,0.35)', 'rgba(124,77,255,0.35)'], grid: true,
    surface: '#0B1224', surface2: '#121C36', line: 'rgba(255,255,255,0.09)',
    text: '#F5F8FF', muted: '#97A4C0', accent: '#3D8BFF', accent2: '#22D3EE', hot: '#FFC857',
    good: '#34D399', bad: '#FF5C7A', onAccent: '#FFFFFF',
    display: 'Space Grotesk', displayWeight: 700, displayTracking: '-0.03em',
  },
  emerald: {
    id: 'emerald', mode: 'dark', bg: '#03110C',
    blobs: ['rgba(45,227,142,0.42)', 'rgba(198,244,50,0.25)', 'rgba(16,120,90,0.5)'], grid: false,
    surface: '#0A1F17', surface2: '#10291F', line: 'rgba(255,255,255,0.08)',
    text: '#F1FFF8', muted: '#8FB3A3', accent: '#2DE38E', accent2: '#C6F432', hot: '#C6F432',
    good: '#2DE38E', bad: '#FF6B6B', onAccent: '#03110C',
    display: 'Sora', displayWeight: 700, displayTracking: '-0.03em',
  },
  coral: {
    id: 'coral', mode: 'light', bg: '#FFF6F0',
    blobs: ['rgba(255,138,101,0.40)', 'rgba(123,97,255,0.22)', 'rgba(255,196,160,0.55)'], grid: false,
    surface: '#FFFFFF', surface2: '#FFF1EA', line: 'rgba(60,30,20,0.09)',
    text: '#1E1412', muted: '#7A6660', accent: '#FF5A36', accent2: '#7B61FF', hot: '#FF5A36',
    good: '#12B76A', bad: '#E5484D', onAccent: '#FFFFFF',
    display: 'Manrope', displayWeight: 800, displayTracking: '-0.035em',
  },
  volt: {
    id: 'volt', mode: 'dark', bg: '#0A0A0C',
    blobs: ['rgba(215,255,58,0.16)', 'rgba(255,255,255,0.06)', 'rgba(215,255,58,0.08)'], grid: true,
    surface: '#151518', surface2: '#1D1D21', line: 'rgba(255,255,255,0.10)',
    text: '#FAFAFA', muted: '#8A8A93', accent: '#D7FF3A', accent2: '#FFFFFF', hot: '#D7FF3A',
    good: '#D7FF3A', bad: '#FF4D4D', onAccent: '#0A0A0C',
    display: 'Space Grotesk', displayWeight: 700, displayTracking: '-0.04em',
  },
  ivory: {
    id: 'ivory', mode: 'light', bg: '#F5F0E8',
    blobs: ['rgba(214,190,150,0.45)', 'rgba(255,255,255,0.8)', 'rgba(168,131,74,0.18)'], grid: false,
    surface: '#FFFDF9', surface2: '#EFE7DA', line: 'rgba(60,45,20,0.12)',
    text: '#1C1814', muted: '#7D7263', accent: '#A8834A', accent2: '#2E4B45', hot: '#A8834A',
    good: '#2E4B45', bad: '#B4533A', onAccent: '#FFFDF9',
    display: 'Instrument Serif', displayWeight: 400, displayTracking: '-0.01em',
  },
  teal: {
    id: 'teal', mode: 'dark', bg: '#021A1F',
    blobs: ['rgba(46,230,214,0.35)', 'rgba(245,181,68,0.20)', 'rgba(20,110,120,0.55)'], grid: true,
    surface: '#062A31', surface2: '#0A353D', line: 'rgba(255,255,255,0.09)',
    text: '#EFFFFD', muted: '#86AFAD', accent: '#2EE6D6', accent2: '#F5B544', hot: '#F5B544',
    good: '#2EE6D6', bad: '#FF6B6B', onAccent: '#021A1F',
    display: 'Sora', displayWeight: 700, displayTracking: '-0.03em',
  },
  lilac: {
    id: 'lilac', mode: 'light', bg: '#F4F1FF',
    blobs: ['rgba(106,77,255,0.28)', 'rgba(255,107,181,0.24)', 'rgba(120,200,255,0.30)'], grid: false,
    surface: '#FFFFFF', surface2: '#F1EDFF', line: 'rgba(40,20,90,0.09)',
    text: '#17132B', muted: '#6E6890', accent: '#6A4DFF', accent2: '#FF6BB5', hot: '#FF7A45',
    good: '#12B76A', bad: '#E5484D', onAccent: '#FFFFFF',
    display: 'Manrope', displayWeight: 800, displayTracking: '-0.035em',
  },
  sand: {
    id: 'sand', mode: 'light', bg: '#F3EDE3',
    blobs: ['rgba(252,163,17,0.20)', 'rgba(20,33,61,0.10)', 'rgba(255,255,255,0.7)'], grid: false,
    surface: '#FFFFFF', surface2: '#EFE6D8', line: 'rgba(20,33,61,0.11)',
    text: '#14213D', muted: '#6B6558', accent: '#14213D', accent2: '#FCA311', hot: '#FCA311',
    good: '#2A7F62', bad: '#C2410C', onAccent: '#FFFFFF',
    display: 'DM Serif Display', displayWeight: 400, displayTracking: '-0.01em',
  },
  aurora: {
    id: 'aurora', mode: 'dark', bg: '#07060F',
    blobs: ['rgba(79,70,229,0.55)', 'rgba(219,39,119,0.40)', 'rgba(6,182,212,0.35)'], grid: false,
    surface: '#100E1E', surface2: '#18152B', line: 'rgba(255,255,255,0.09)',
    text: '#F7F5FF', muted: '#A39FC0', accent: '#8B7CFF', accent2: '#FF5FA2', hot: '#FFB84D',
    good: '#3DDC97', bad: '#FF5C7A', onAccent: '#FFFFFF',
    display: 'Space Grotesk', displayWeight: 700, displayTracking: '-0.035em',
  },
  brand: {
    id: 'brand', mode: 'dark', bg: '#07080C',
    blobs: ['rgba(61,165,255,0.34)', 'rgba(217,178,111,0.22)', 'rgba(61,90,255,0.28)'], grid: false,
    surface: '#0E1118', surface2: '#151923', line: 'rgba(255,255,255,0.08)',
    text: '#F6F4EF', muted: '#9EA3AE', accent: '#4DA8FF', accent2: '#D9B26F', hot: '#D9B26F',
    good: '#4ADE80', bad: '#FF6B6B', onAccent: '#07080C',
    display: 'Instrument Serif', displayWeight: 400, displayTracking: '-0.01em',
  },
} satisfies Record<string, Theme>;

export const BODY = INTER;

export const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
