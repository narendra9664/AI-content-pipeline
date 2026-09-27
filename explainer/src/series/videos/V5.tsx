import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BellRing, CalendarCheck, Check, Eye, FileText, MessageCircle, MousePointerClick} from 'lucide-react';
import {BODY, CLAMP, THEMES, alpha} from '../theme';
import {VOData, at} from '../vo';
import vo5 from '../vo/v5.json';
import {Stage} from '../kit/Stage';
import {SpokenHeadline} from '../kit/Text';
import {Phone} from '../kit/Frames';
import {SiteMobile} from '../kit/Site';
import {Chip, Rise, Show} from '../kit/Misc';
import {Avatar, LeadRow, ScoreRing, lead} from '../kit/Lead';
import {ChatCard, Toast} from '../kit/Chat';
import {EndCard, FDMark} from '../kit/Logo';
import {Soundtrack} from '../kit/Audio';

const T = THEMES.ivory;
const vo = vo5 as VOData;
export const V5_FRAMES = Math.ceil(vo.duration * 30) + 45;
const w = (word: string, n = 1) => at(vo, word, n);
const SERIF = T.display;

// "01 Track" style step header.
const StepHead: React.FC<{n: string; title: string; start: number; end: number}> = ({n, title, start, end}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - start, fps, config: {damping: 18, stiffness: 90}});
  const out = interpolate(frame, [end - 8, end], [0, 1], CLAMP);
  const line = interpolate(frame, [start + 6, start + 26], [0, 1], {...CLAMP, easing: (x) => 1 - Math.pow(1 - x, 3)});
  return (
    <div style={{position: 'absolute', left: 90, top: 190, opacity: p * (1 - out), transform: `translateY(${(1 - p) * 40 - out * 30}px)`}}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 34}}>
        <div style={{fontFamily: SERIF, fontSize: 210, lineHeight: 0.9, color: T.accent, fontStyle: 'italic'}}>{n}</div>
        <div style={{fontFamily: SERIF, fontSize: 150, lineHeight: 0.9, color: T.text, letterSpacing: '-0.02em'}}>{title}</div>
      </div>
      <div style={{marginTop: 26, height: 2, width: 900 * line, background: `linear-gradient(90deg, ${T.accent}, ${alpha(T.accent, 0)})`}} />
    </div>
  );
};

const Intro: React.FC<{end: number}> = ({end}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tVisitors = w('visitors');
  const tBooked = w('booked');
  const dot = interpolate(frame, [tVisitors + 6, tBooked + 6], [0, 1], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  const out = interpolate(frame, [end - 8, end], [0, 1], CLAMP);
  const card = (icon: React.ReactNode, label: string, sub: string, t: number, y: number, gold?: boolean) => {
    const p = spring({frame: frame - t, fps, config: {damping: 16}});
    return (
      <div
        style={{
          position: 'absolute', left: 190, top: y, width: 700, height: 150, borderRadius: 34, display: 'flex', alignItems: 'center', gap: 30, padding: '0 36px',
          background: gold ? T.text : T.surface, border: `1px solid ${gold ? T.text : T.line}`, boxShadow: '0 30px 70px rgba(60,45,20,0.12)',
          opacity: p, transform: `translateY(${(1 - p) * 40}px)`, fontFamily: BODY,
        }}
      >
        <div style={{width: 84, height: 84, borderRadius: 24, background: gold ? T.accent : alpha(T.accent, 0.14), color: gold ? '#fff' : T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
        <div>
          <div style={{fontFamily: SERIF, fontSize: 56, lineHeight: 1, color: gold ? '#FFFDF9' : T.text}}>{label}</div>
          <div style={{fontSize: 26, fontWeight: 600, color: gold ? alpha('#FFFDF9', 0.65) : T.muted, marginTop: 6}}>{sub}</div>
        </div>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
      {card(<Eye size={42} strokeWidth={2} />, 'Website visitor', 'Anonymous, browsing', 8, 560)}
      {/* connector */}
      <div style={{position: 'absolute', left: 538, top: 716, width: 4, height: 250, background: alpha(T.accent, 0.25)}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 4, height: 250 * dot, background: T.accent}} />
        <div style={{position: 'absolute', left: -13, top: 250 * dot - 15, width: 30, height: 30, borderRadius: 30, background: T.accent, boxShadow: `0 0 20px ${T.accent}`}} />
      </div>
      <div style={{position: 'absolute', left: 490, top: 790, width: 100, height: 100, borderRadius: 100, background: T.surface, border: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(60,45,20,0.12)', opacity: spring({frame: frame - 20, fps, config: {damping: 200}})}}>
        <FDMark size={52} color={T.accent} color2={T.accent2} />
      </div>
      {card(<CalendarCheck size={42} strokeWidth={2} />, 'Booked viewing', 'Sat 11:00 · Penthouse 42A', tBooked, 976, true)}
    </div>
  );
};

const TrackViz: React.FC = () => {
  const frame = useCurrentFrame();
  const tVisit = w('visit,');
  const tClick = w('click');
  const tInq = w('inquiry');
  const tCap = w('captured.');
  const scroll = interpolate(frame, [tVisit - 20, tInq + 10], [0, 460], {...CLAMP, easing: (x) => x * x * (3 - 2 * x)});
  const captured = frame >= tCap;
  const items: [number, React.ReactNode, string, string][] = [
    [tVisit, <Eye key="e" size={30} strokeWidth={2.4} />, 'Visit', 'Penthouse 42A'],
    [tClick, <MousePointerClick key="c" size={30} strokeWidth={2.4} />, 'Click', 'Floor plans'],
    [tInq, <MessageCircle key="m" size={30} strokeWidth={2.4} />, 'Inquiry', 'Private viewing'],
  ];
  return (
    <>
      <div style={{position: 'absolute', left: 90, top: 540}}>
        <Rise at={w('track.') - 4} dy={80}>
          <Phone width={360} screenBg="#F6F3EE">
            <SiteMobile variant="light" scroll={scroll} glow={{ph42a: frame >= tVisit ? 1 : 0}} />
          </Phone>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 500, top: 640, display: 'flex', flexDirection: 'column', gap: 26}}>
        {items.map(([t, icon, label, sub]) => (
          <Rise key={label} at={t} dx={-60} dy={0}>
            <div
              style={{
                width: 500, display: 'flex', alignItems: 'center', gap: 20, padding: '22px 26px', borderRadius: 28, background: T.surface,
                border: `1.5px solid ${captured ? alpha(T.accent2, 0.6) : T.line}`, boxShadow: '0 24px 60px rgba(60,45,20,0.10)', fontFamily: BODY,
              }}
            >
              <div style={{width: 64, height: 64, borderRadius: 20, background: alpha(T.accent, 0.14), color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{icon}</div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 800, fontSize: 34, color: T.text}}>{label}</div>
                <div style={{fontWeight: 500, fontSize: 25, color: T.muted}}>{sub}</div>
              </div>
              <div style={{width: 46, height: 46, borderRadius: 46, background: captured ? T.accent2 : 'transparent', border: `2px solid ${captured ? T.accent2 : T.line}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {captured ? <Check size={26} strokeWidth={3} /> : null}
              </div>
            </div>
          </Rise>
        ))}
        <Rise at={tCap} dy={20}>
          <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 28, color: T.accent2, paddingLeft: 10}}>Captured automatically</div>
        </Rise>
      </div>
    </>
  );
};

const RankViz: React.FC = () => {
  const tRank = w('rank.');
  const tIntent = w('intent');
  const tKnows = w('knows');
  const sarah = lead('sarah');
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center'}}>
        <Rise at={tRank - 2} dy={60}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 40, padding: '34px 46px', borderRadius: 40, background: T.surface, border: `1px solid ${T.line}`,
              boxShadow: '0 30px 80px rgba(60,45,20,0.12)', fontFamily: BODY,
            }}
          >
            <ScoreRing theme={T} value={92} size={250} start={tIntent - 6} label="INTENT" color={T.accent} />
            <div>
              <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <Avatar name={sarah.name} tone={sarah.tone} size={70} />
                <div style={{fontFamily: SERIF, fontSize: 60, color: T.text}}>{sarah.name}</div>
              </div>
              <div style={{fontSize: 27, fontWeight: 600, color: T.muted, marginTop: 14, lineHeight: 1.4}}>
                4 visits · floor plans
                <br />
                asked about pricing
              </div>
            </div>
          </div>
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 90, top: 930, display: 'flex', flexDirection: 'column', gap: 14}}>
        {['sarah', 'omar', 'james'].map((id, i) => (
          <Rise key={id} at={tKnows + i * 5} dy={40}>
            <LeadRow theme={T} l={lead(id)} rank={i + 1} width={900} h={108} focus={i === 0 ? 1 : 0} />
          </Rise>
        ))}
      </div>
    </>
  );
};

const FollowViz: React.FC = () => {
  const tPersonal = w('personal');
  const tInstantly = w('instantly,');
  const tRight = w('right');
  return (
    <>
      <div style={{position: 'absolute', left: 90, top: 560}}>
        <Rise at={w('follow') - 4} dy={60}>
          <ChatCard
            theme={T} width={900} name="Sarah K." tone={0} status="WhatsApp · sent instantly" size={34} readAt={tInstantly + 20}
            messages={[{from: 'us', text: 'Hi Sarah, lovely to see you back on Penthouse 42A. Shall I hold a private viewing for you this Saturday?', at: tPersonal, typing: 14}]}
          />
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 950, display: 'flex', justifyContent: 'center'}}>
        <Rise at={tInstantly} dy={30}>
          <Chip theme={T} icon={<Check size={32} strokeWidth={2.6} />} text="Sent in seconds" meta="· personal, not a template" color={T.accent2} size={36} />
        </Rise>
      </div>
      <div style={{position: 'absolute', left: 90, top: 1070}}>
        <Rise at={tRight - 4} dy={40}>
          <Toast theme={T} at={tRight - 4} width={900} icon={<BellRing size={34} strokeWidth={2.4} />} title="Maya · new hot lead" body="Sarah K. · 92 · Penthouse 42A" meta="now" color={T.accent} size={36} />
        </Rise>
      </div>
    </>
  );
};

const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const times = [w('track.', 2), w('rank.', 2), w('follow', 2)];
  const steps: [string, string, React.ReactNode][] = [
    ['01', 'Track', <Eye key="t" size={44} strokeWidth={2} />],
    ['02', 'Rank', <FileText key="r" size={44} strokeWidth={2} />],
    ['03', 'Follow up', <MessageCircle key="f" size={44} strokeWidth={2} />],
  ];
  return (
    <div style={{position: 'absolute', left: 140, top: 560, display: 'flex', flexDirection: 'column', gap: 40}}>
      {steps.map(([n, title], i) => {
        const p = spring({frame: frame - times[i], fps, config: {damping: 15}});
        const on = frame >= times[i];
        return (
          <div key={n} style={{display: 'flex', alignItems: 'baseline', gap: 36, opacity: 0.25 + 0.75 * Math.min(1, p), transform: `translateX(${(1 - Math.min(1, p)) * -30}px)`}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 120, color: on ? T.accent : T.muted, width: 150}}>{n}</div>
            <div style={{fontFamily: SERIF, fontSize: 140, color: T.text, letterSpacing: '-0.02em'}}>{title}</div>
          </div>
        );
      })}
    </div>
  );
};

export const V5: React.FC = () => {
  const tOne = w('one.');
  const tTwo = w('two.');
  const tThree = w('three.');
  const tRecap = w('track.', 2);
  const tDM = w('dm');
  const tEnd = tDM - 20;
  return (
    <AbsoluteFill>
      <Stage theme={T} calm>
        <Show to={tOne}>
          <div style={{position: 'absolute', left: 90, top: 200}}>
            <Rise at={2} exitAt={tOne - 8} dy={30}>
              <div style={{fontFamily: SERIF, fontSize: 118, lineHeight: 0.98, color: T.text}}>
                From visitor
                <br />
                to <span style={{fontStyle: 'italic', color: T.accent}}>viewing.</span>
              </div>
            </Rise>
          </div>
          <Intro end={tOne} />
        </Show>

        <Show from={tOne - 4} to={tTwo}>
          <StepHead n="01" title="Track" start={tOne - 4} end={tTwo} />
          <TrackViz />
        </Show>
        <Show from={tTwo - 4} to={tThree}>
          <StepHead n="02" title="Rank" start={tTwo - 4} end={tThree} />
          <RankViz />
        </Show>
        <Show from={tThree - 4} to={tRecap - 4}>
          <StepHead n="03" title="Follow up" start={tThree - 4} end={tRecap - 4} />
          <FollowViz />
        </Show>
        <Show from={tRecap - 6} to={tEnd}>
          <Rise at={tRecap - 6} exitAt={tEnd - 10} dy={0} scale={1}>
            <Recap />
          </Rise>
        </Show>

        <SpokenHeadline theme={T} vo={vo} size={52} y={1370} width={900} display={false} hideAfter={tEnd} splitComma emph={['track.', 'rank.', 'follow', 'up.']} />
        <Sequence from={tEnd}>
          <EndCard theme={T} headline="See it on *your* site." ctaAt={tDM - tEnd + 12} italicAccent />
        </Sequence>
      </Stage>
      <Soundtrack
        vo="v5" music="luxury" musicVol={0.3}
        cues={[
          [8, 'pop', 0.2], [w('booked'), 'chime', 0.14], [tOne - 4, 'whoosh', 0.2], [w('visit,'), 'pop', 0.22], [w('click'), 'click'], [w('inquiry'), 'pop', 0.22], [w('captured.'), 'sparkle'],
          [tTwo - 4, 'whoosh', 0.2], [w('intent') - 6, 'blips', 0.35], [w('knows'), 'pop', 0.2], [tThree - 4, 'whoosh', 0.2], [w('personal') - 14, 'typing', 0.3], [w('personal'), 'send'],
          [w('right') - 4, 'chime', 0.16], [tRecap, 'pop', 0.2], [w('rank.', 2), 'pop', 0.2], [w('follow', 2), 'pop', 0.2], [tEnd, 'whoosh', 0.2], [tEnd + 14, 'sparkle'], [tDM + 12, 'pop'],
        ]}
      />
    </AbsoluteFill>
  );
};
