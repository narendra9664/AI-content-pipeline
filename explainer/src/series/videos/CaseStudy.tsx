/**
 * Video 11: case-study template (9:16, music only). Fill it with REAL numbers from a client,
 * never estimates. Every field defaults to a [bracketed placeholder] so an unfilled render
 * can't be mistaken for a result.
 *
 * Render:
 *   npx remotion render src/index.ts CaseStudy out/series/CaseStudy-raw.mp4 --props=case-study.json
 *   FFMPEG=… python3 scripts/finalize.py out/series/CaseStudy-raw.mp4 out/series/CaseStudy.mp4
 *
 * case-study.json (example shape; use your measured numbers):
 *   {"client": "A luxury developer in [city]", "headline": "Every buyer answered *in seconds.*",
 *    "period": "First 60 days", "metrics": [{"label": "Reply to a new enquiry", "before": "…", "after": "…"}],
 *    "quote": "…", "author": "…, Head of Sales"}
 */
import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArrowRight} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {Stage} from '../kit/Stage';
import {Label, Words} from '../kit/Text';
import {Rise} from '../kit/Misc';
import {EndCard} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.brand;

export type Metric = {label: string; before: string; after: string};
export type CaseStudyProps = {
  client: string;
  headline: string; // Words markup: *accent*
  period: string;
  metrics: Metric[]; // 1 to 3
  quote: string;
  author: string;
};

export const CASE_STUDY_DEFAULTS: CaseStudyProps = {
  client: '[Client or "A luxury developer in City"]',
  headline: '[Result in one line, e.g. every buyer answered *in seconds.*]',
  period: '[Measured over: e.g. first 60 days]',
  metrics: [
    {label: '[Reply time to a new enquiry]', before: '[before]', after: '[after]'},
    {label: '[Viewings booked per month]', before: '[before]', after: '[after]'},
    {label: '[Leads contacted per agent per day]', before: '[before]', after: '[after]'},
  ],
  quote: '[One sentence from their sales lead, used with permission.]',
  author: '[Name, title]',
};

export const CASE_STUDY_FRAMES = 22 * 30;

const MetricCard: React.FC<{m: Metric; at: number}> = ({m, at}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 110}});
  const flip = spring({frame: frame - at - 24, fps, config: {damping: 14, stiffness: 120}});
  const strike = interpolate(frame, [at + 18, at + 28], [0, 1], CLAMP);
  return (
    <div
      style={{
        width: 900, padding: '34px 40px', borderRadius: 34, background: T.surface, border: `1px solid ${T.line}`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 60px ${alpha(T.accent2, 0.08 * flip)}`,
        opacity: p, transform: `translateY(${(1 - p) * 60}px)`, fontFamily: BODY,
      }}
    >
      <div style={{fontWeight: 700, fontSize: 30, color: T.muted}}>{m.label}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 16}}>
        <div style={{position: 'relative', fontFamily: T.display, fontSize: 88, lineHeight: 1, color: T.muted}}>
          {m.before}
          <div style={{position: 'absolute', left: -4, top: '52%', height: 6, width: `calc(${strike * 100}% + 8px)`, background: alpha(T.bad, 0.85), borderRadius: 6}} />
        </div>
        <div style={{color: T.accent2, opacity: flip, display: 'flex'}}>
          <ArrowRight size={54} strokeWidth={2} />
        </div>
        <div style={{fontFamily: T.display, fontSize: 104, lineHeight: 1, color: T.accent2, fontStyle: 'italic', opacity: flip, transform: `scale(${0.85 + 0.15 * flip})`, transformOrigin: 'left center'}}>
          {m.after}
        </div>
      </div>
    </div>
  );
};

export const CaseStudy: React.FC<Partial<CaseStudyProps>> = (props) => {
  const c = {...CASE_STUDY_DEFAULTS, ...props};
  const metrics = c.metrics.slice(0, 3);
  const tMetrics = 96;
  const step = 66;
  const tQuote = tMetrics + metrics.length * step + 40;
  const tEnd = tQuote + 150;
  return (
    <AbsoluteFill>
      <Stage theme={T}>
        {/* 1. who and what */}
        <div style={{position: 'absolute', left: 90, right: 90, top: 250}}>
          <Rise at={0} exitAt={tQuote - 12} dy={20}>
            <Label theme={T} color={T.accent2} size={24}>Case study · {c.period}</Label>
          </Rise>
          <div style={{marginTop: 34}}>
            <Words theme={T} text={c.headline} size={96} start={8} align="left" maxWidth={900} italicAccent exitAt={tQuote - 12} />
          </div>
          <Rise at={30} exitAt={tQuote - 12} dy={20}>
            <div style={{marginTop: 26, fontFamily: BODY, fontWeight: 600, fontSize: 32, color: T.muted}}>{c.client}</div>
          </Rise>
        </div>

        {/* 2. the numbers */}
        <div style={{position: 'absolute', left: 90, top: 820, display: 'flex', flexDirection: 'column', gap: 26}}>
          {metrics.map((m, i) => (
            <Rise key={i} at={tMetrics + i * step} exitAt={tQuote - 12} dy={0} scale={1} blur={false}>
              <MetricCard m={m} at={tMetrics + i * step} />
            </Rise>
          ))}
        </div>

        {/* 3. the quote */}
        <div style={{position: 'absolute', left: 90, right: 90, top: 560}}>
          <Rise at={tQuote} exitAt={tEnd - 10} dy={40}>
            <div style={{fontFamily: T.display, fontSize: 150, lineHeight: 0.6, color: T.accent2}}>&ldquo;</div>
            <div style={{fontFamily: T.display, fontSize: 76, lineHeight: 1.08, color: T.text, marginTop: 10}}>{c.quote}</div>
            <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 32, color: T.muted, marginTop: 40}}>{c.author}</div>
          </Rise>
        </div>

        <Sequence from={tEnd}>
          <EndCard theme={T} headline="Want this for *your launch?*" ctaAt={40} italicAccent />
        </Sequence>
      </Stage>
      <Soundtrack
        music="luxury" musicVol={0.9}
        cues={[
          [2, 'whoosh', 0.2], ...metrics.map((_, i): [number, 'pop'] => [tMetrics + i * step + 24, 'pop']),
          [tQuote, 'whoosh', 0.2], [tEnd, 'whoosh', 0.2], [tEnd + 16, 'sparkle'], [tEnd + 40, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
