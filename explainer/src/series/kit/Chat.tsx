import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalendarCheck, CheckCheck, Zap} from 'lucide-react';
import {BODY, CLAMP, Theme, alpha} from '../theme';
import {Avatar} from './Lead';

export type Msg = {from: 'us' | 'them' | 'system'; text: string; at: number; typing?: number};

const Dots: React.FC<{color: string; size: number}> = ({color, size}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{display: 'flex', gap: size * 0.5, padding: `${size * 0.9}px ${size * 1.2}px`}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: size, height: size, borderRadius: size, background: color, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - i * 4) / 4))}} />
      ))}
    </div>
  );
};

// A messaging thread as a floating card. Space for every message is reserved up front so
// bubbles appear top-down without the card jumping.
export const ChatCard: React.FC<{
  theme: Theme;
  width: number;
  name: string;
  tone: number;
  status?: string;
  messages: Msg[];
  size?: number; // base font size
  readAt?: number;
}> = ({theme, width, name, tone, status = 'via WhatsApp · automated', messages, size = 30, readAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const light = theme.mode === 'light';
  return (
    <div
      style={{
        width, borderRadius: size * 1.2, overflow: 'hidden', background: theme.surface, border: `1px solid ${theme.line}`,
        boxShadow: `0 ${size}px ${size * 3}px rgba(0,0,0,${light ? 0.12 : 0.45})`, fontFamily: BODY,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: size * 0.6, padding: `${size * 0.7}px ${size * 0.9}px`, borderBottom: `1px solid ${theme.line}`, background: theme.surface2}}>
        <Avatar name={name} tone={tone} size={size * 2} />
        <div style={{flex: 1}}>
          <div style={{fontWeight: 700, fontSize: size * 1.02, color: theme.text}}>{name}</div>
          <div style={{fontWeight: 500, fontSize: size * 0.72, color: theme.muted, display: 'flex', alignItems: 'center', gap: 6}}>
            <Zap size={size * 0.7} color={theme.accent} strokeWidth={2.6} /> {status}
          </div>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: size * 0.5, padding: size * 0.9}}>
        {messages.map((m, i) => {
          const p = spring({frame: frame - m.at, fps, config: {damping: 15, stiffness: 160, mass: 0.6}});
          const typing = m.typing !== undefined && frame >= m.at - m.typing && frame < m.at;
          const align = m.from === 'us' ? 'flex-end' : m.from === 'them' ? 'flex-start' : 'center';
          if (m.from === 'system') {
            return (
              <div key={i} style={{alignSelf: 'center', opacity: p, transform: `scale(${0.85 + 0.15 * p})`}}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.4}px ${size * 0.8}px`, borderRadius: 999,
                    background: alpha(theme.good, 0.14), border: `1px solid ${alpha(theme.good, 0.5)}`, color: theme.good, fontWeight: 700, fontSize: size * 0.8,
                  }}
                >
                  <CalendarCheck size={size * 0.85} strokeWidth={2.4} /> {m.text}
                </div>
              </div>
            );
          }
          const us = m.from === 'us';
          const bg = us ? theme.accent : theme.surface2;
          const fg = us ? theme.onAccent : theme.text;
          return (
            <div key={i} style={{alignSelf: align, maxWidth: '84%', position: 'relative'}}>
              {typing ? (
                <div style={{position: 'absolute', [us ? 'right' : 'left']: 0, top: 0, borderRadius: size * 0.8, background: bg}}>
                  <Dots color={fg} size={size * 0.32} />
                </div>
              ) : null}
              <div
                style={{
                  padding: `${size * 0.5}px ${size * 0.72}px`, borderRadius: size * 0.8,
                  borderBottomRightRadius: us ? size * 0.2 : size * 0.8, borderBottomLeftRadius: us ? size * 0.8 : size * 0.2,
                  background: bg, color: fg, fontWeight: 500, fontSize: size, lineHeight: 1.32,
                  opacity: Math.min(1, p * 1.4), transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: us ? '100% 100%' : '0% 100%',
                }}
              >
                {m.text}
                {us ? (
                  <span style={{display: 'inline-flex', marginLeft: size * 0.3, verticalAlign: 'middle', color: readAt !== undefined && frame >= readAt ? theme.accent2 : alpha(fg, 0.6)}}>
                    <CheckCheck size={size * 0.75} strokeWidth={2.4} />
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Notification that drops in (agent alert, booking, etc.).
export const Toast: React.FC<{
  theme: Theme;
  at: number;
  width: number;
  icon: React.ReactNode;
  title: string;
  body: string;
  meta?: string;
  size?: number;
  exitAt?: number;
  color?: string;
}> = ({theme, at, width, icon, title, body, meta = 'now', size = 28, exitAt, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 15, stiffness: 150}});
  const out = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], CLAMP);
  const c = color ?? theme.accent;
  return (
    <div
      style={{
        width, display: 'flex', alignItems: 'center', gap: size * 0.7, padding: `${size * 0.7}px ${size * 0.8}px`, borderRadius: size * 1.1,
        background: theme.mode === 'dark' ? alpha('#FFFFFF', 0.08) : alpha('#FFFFFF', 0.92), border: `1px solid ${alpha(c, 0.45)}`,
        backdropFilter: 'blur(20px)', boxShadow: `0 ${size}px ${size * 2.4}px rgba(0,0,0,${theme.mode === 'dark' ? 0.4 : 0.12}), 0 0 ${size * 1.5}px ${alpha(c, 0.25)}`,
        fontFamily: BODY, opacity: Math.min(1, p * 1.5) * (1 - out),
        transform: `translateY(${(1 - p) * -size * 3 - out * size * 2}px) scale(${0.92 + 0.08 * p})`,
      }}
    >
      <div style={{width: size * 2, height: size * 2, borderRadius: size * 0.6, background: c, color: theme.onAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
        {icon}
      </div>
      <div style={{flex: 1, minWidth: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
          <div style={{fontWeight: 800, fontSize: size * 0.95, color: theme.text, letterSpacing: '-0.01em'}}>{title}</div>
          <div style={{fontWeight: 500, fontSize: size * 0.7, color: theme.muted}}>{meta}</div>
        </div>
        <div style={{fontWeight: 500, fontSize: size * 0.8, color: theme.muted, marginTop: 2}}>{body}</div>
      </div>
    </div>
  );
};
