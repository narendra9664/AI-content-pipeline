import type React from 'react';

// frontdesk AI brand tokens (from brand/config.json), tuned for motion.
export const C = {
  bg: '#06070C',
  surface: '#0F121C',
  surface2: '#161A28',
  line: 'rgba(255,255,255,0.08)',
  blue: '#00A3FF',
  violet: '#7C4DFF',
  gold: '#FFD700',
  amber: '#FFB300',
  green: '#00E676',
  red: '#FF5A5A',
  text: '#FFFFFF',
  muted: '#A0A0B0',
  dim: '#6B6F80',
};

export const FONT = 'Inter, system-ui, sans-serif';
export const GRAD_BLUE = `linear-gradient(90deg, ${C.blue}, ${C.violet})`;
export const GRAD_GOLD = `linear-gradient(90deg, #FFE680, ${C.amber})`;

export const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const gradientText = (gradient: string): React.CSSProperties => ({
  backgroundImage: gradient,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});
