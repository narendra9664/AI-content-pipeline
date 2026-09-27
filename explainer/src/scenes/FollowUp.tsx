import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CheckCheck, Flame, Send, Sparkles, Zap} from 'lucide-react';
import {Avatar, StepHeading} from '../components/Bits';
import {Panel} from '../components/Panel';
import {C, CLAMP, FONT} from '../theme';

const MESSAGE =
  'Hi Sarah — the Penthouse 42A floor plan you viewed has a private viewing slot this Thursday at 6 PM. Shall I hold it for you?';
const REPLY = 'Yes please! Can my husband join too?';

const TYPE_START = 20;
const TYPE_END = 84;
const SEND_AT = 92;
const READ_AT = 104;
const DOTS_FROM = 112;
const REPLY_AT = 140;
const TOAST_AT = 152;

export const FollowUp: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const typed = Math.round(interpolate(frame, [TYPE_START, TYPE_END], [0, MESSAGE.length], CLAMP));
  const composer = interpolate(frame, [SEND_AT - 2, SEND_AT + 8], [1, 0], CLAMP);
  const sent = spring({frame: frame - SEND_AT, fps, config: {damping: 15, stiffness: 150}});
  const sendPress = frame >= SEND_AT - 3 && frame < SEND_AT + 3 ? 0.86 : 1;
  const dots = frame >= DOTS_FROM && frame < REPLY_AT;
  const reply = spring({frame: frame - REPLY_AT, fps, config: {damping: 14, stiffness: 150}});
  const toast = spring({frame: frame - TOAST_AT, fps, config: {damping: 14, stiffness: 120}});
  const caretOn = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill style={{fontFamily: FONT, color: C.text}}>
      <StepHeading
        step="03 — FOLLOW UP"
        title="Instant, *personal* follow-up."
        sub="Sent in seconds on the channel they already use — then routed to the right agent."
        y={230}
      />
      {/* agent notification */}
      <div
        style={{
          position: 'absolute',
          left: 130,
          top: 700,
          width: 640,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '22px 26px',
          borderRadius: 22,
          background: 'linear-gradient(180deg, rgba(30,26,12,0.96), rgba(18,16,10,0.96))',
          border: '1px solid rgba(255,200,0,0.45)',
          boxShadow: '0 0 60px rgba(255,190,0,0.18), 0 30px 60px rgba(0,0,0,0.5)',
          opacity: Math.min(1, toast * 1.5),
          transform: `translateY(${(1 - toast) * 80}px) scale(${0.9 + toast * 0.1})`,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            background: 'linear-gradient(135deg, #FFE680, #FFB300)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Flame size={32} color="#1A1200" strokeWidth={2.5} />
        </div>
        <div>
          <div style={{fontSize: 27, fontWeight: 700}}>Hot lead routed to James R.</div>
          <div style={{fontSize: 21, color: C.muted, marginTop: 4}}>Viewing booked · Thu 6:00 PM</div>
        </div>
        <div style={{marginLeft: 'auto', fontSize: 18, color: C.dim, alignSelf: 'flex-start'}}>now</div>
      </div>

      <Panel x={1020} y={90} width={740} height={900} title="Conversations" enter={0}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '20px 30px',
            borderBottom: `1px solid ${C.line}`,
          }}
        >
          <Avatar initials="SM" size={60} tone={1} />
          <div>
            <div style={{fontSize: 27, fontWeight: 700}}>Sarah M.</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, color: C.green, marginTop: 2}}>
              <div style={{width: 9, height: 9, borderRadius: 5, background: C.green}} />
              online · via WhatsApp
            </div>
          </div>
          <div
            style={{
              marginLeft: 'auto',
              padding: '7px 14px',
              borderRadius: 10,
              background: 'rgba(255,215,0,0.12)',
              color: C.gold,
              fontSize: 17,
              fontWeight: 700,
            }}
          >
            Intent 92
          </div>
        </div>

        {/* thread, bottom-aligned above the composer */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 30,
            top: 110,
            bottom: 150,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            gap: 18,
          }}
        >
          <div
            style={{
              alignSelf: 'center',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.05)',
              fontSize: 16,
              color: C.dim,
              fontWeight: 600,
            }}
          >
            Today · 11:49 PM
          </div>
          <div
            style={{
              alignSelf: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 12,
              background: 'rgba(0,163,255,0.08)',
              border: '1px solid rgba(0,163,255,0.3)',
              fontSize: 17,
              color: C.muted,
              fontWeight: 600,
              opacity: interpolate(frame, [10, 22], [0, 1], CLAMP),
            }}
          >
            <Zap size={16} color={C.blue} strokeWidth={2.6} />
            Triggered by: pricing page visit · intent 92
          </div>
          {sent > 0.01 ? (
            <div
              style={{
                alignSelf: 'flex-end',
                maxWidth: 520,
                opacity: Math.min(1, sent * 1.5),
                transform: `translateY(${(1 - sent) * 60}px) scale(${0.92 + 0.08 * sent})`,
                transformOrigin: 'bottom right',
              }}
            >
              <div
                style={{
                  padding: '18px 22px',
                  borderRadius: '22px 22px 6px 22px',
                  background: 'linear-gradient(135deg, #0A7FD6, #5B3FE0)',
                  fontSize: 23,
                  lineHeight: 1.45,
                  fontWeight: 500,
                  boxShadow: '0 10px 30px rgba(0,120,255,0.3)',
                }}
              >
                {MESSAGE}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8,
                  fontSize: 16,
                  color: C.dim,
                }}
              >
                <Sparkles size={15} color={C.blue} /> Auto-sent by frontdesk AI
                <CheckCheck size={20} color={frame >= READ_AT ? C.blue : C.dim} strokeWidth={2.4} />
              </div>
            </div>
          ) : null}
          {dots ? (
            <div
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                gap: 7,
                padding: '18px 22px',
                borderRadius: '22px 22px 22px 6px',
                background: C.surface2,
              }}
            >
              {[0, 1, 2].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 6,
                    background: C.muted,
                    transform: `translateY(${Math.sin((frame - DOTS_FROM) / 3 - d) * 4}px)`,
                  }}
                />
              ))}
            </div>
          ) : null}
          {reply > 0.01 ? (
            <div
              style={{
                alignSelf: 'flex-start',
                maxWidth: 480,
                padding: '18px 22px',
                borderRadius: '22px 22px 22px 6px',
                background: C.surface2,
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 23,
                lineHeight: 1.45,
                fontWeight: 500,
                opacity: Math.min(1, reply * 1.5),
                transform: `translateY(${(1 - reply) * 40}px)`,
                transformOrigin: 'bottom left',
              }}
            >
              {REPLY}
            </div>
          ) : null}
        </div>

        {/* AI composer */}
        <div
          style={{
            position: 'absolute',
            left: 24,
            right: 24,
            bottom: 22,
            minHeight: 104,
            borderRadius: 20,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${composer > 0.5 && frame > TYPE_START ? 'rgba(0,163,255,0.55)' : C.line}`,
            padding: '14px 90px 14px 20px',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: C.blue}}>
            <Sparkles size={16} color={C.blue} />
            {frame < TYPE_START ? 'Waiting for a signal…' : frame < SEND_AT ? 'AI is writing a personal follow-up…' : 'Delivered'}
          </div>
          <div style={{marginTop: 6, fontSize: 19, lineHeight: 1.4, color: C.text, opacity: composer, minHeight: 27}}>
            {MESSAGE.slice(0, typed)}
            {frame >= TYPE_START && frame < SEND_AT && caretOn ? (
              <span style={{display: 'inline-block', width: 2, height: 22, background: C.blue, marginLeft: 2, verticalAlign: 'middle'}} />
            ) : null}
          </div>
          <div
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              width: 58,
              height: 58,
              borderRadius: 29,
              background: `linear-gradient(135deg, ${C.blue}, ${C.violet})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${sendPress})`,
              boxShadow: '0 0 24px rgba(0,163,255,0.5)',
            }}
          >
            <Send size={26} color="#fff" strokeWidth={2.4} />
          </div>
        </div>
      </Panel>
    </AbsoluteFill>
  );
};
