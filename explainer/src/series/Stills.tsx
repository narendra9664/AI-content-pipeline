import React from 'react';
import {AbsoluteFill} from 'remotion';
import {BellRing} from 'lucide-react';
import {THEMES, alpha} from './theme';
import {Stage} from './kit/Stage';
import {Browser, BrowserStack} from './kit/Frames';
import {D, DESKTOP_OUTLINES, Signals, SiteDesktop, XRay} from './kit/Site';
import {Queue} from './kit/Lead';
import {ChatCard, Toast} from './kit/Chat';
import {Dashboard} from './videos/H4';

// Static product visuals for the website, rendered from the same components as the videos.
const T = THEMES.brand;

// The site lifted off its tracking layer (render at frame 60 so every tag has landed).
export const StillBeneath: React.FC = () => (
  <AbsoluteFill>
    <Stage theme={T} calm>
      <div style={{position: 'absolute', left: 170, top: 150}}>
        <BrowserStack
          width={1260} lh={760} url="veloria-residences.com" rx={50} rz={-16} scale={0.74} chromeOpacity={0}
          layers={[
            {
              key: 'x', z: 0, bg: T.surface, shadow: `0 0 0 2px ${alpha(T.accent, 0.7)}, 0 0 90px ${alpha(T.accent, 0.35)}`,
              node: (
                <XRay
                  theme={T} boxes={D} outlines={DESKTOP_OUTLINES} w={1280} h={760} tagSize={20} gridSize={32}
                  tags={[
                    {id: 'ph42a', text: 'Opened ×4', icon: 'repeat', at: 0, hot: true},
                    {id: 'sv38c', text: 'Compared', icon: 'eye', at: 4},
                    {id: 'plans', text: 'Floor plans', icon: 'download', at: 8, dx: 0, dy: -44},
                    {id: 'navBook', text: 'Enquiry', icon: 'tap', at: 12, dx: -40, dy: 56},
                  ]}
                  heat={[{id: 'ph42a', at: 0}, {id: 'image', at: 0, r: 240}, {id: 'plans', at: 0, r: 130}]}
                  header={{text: 'Live · returning visitor · visit 4', at: 0}}
                />
              ),
            },
            {key: 's', z: 170, node: <Signals theme={T} boxes={D} ids={['headline', 'image', 'plans', 'ph42a', 'sv38c', 'navBook']} />},
            {key: 'site', z: 340, opacity: 0.94, bg: '#0D0E11', shadow: '0 80px 140px rgba(0,0,0,0.55)', node: <SiteDesktop />},
          ]}
        />
      </div>
    </Stage>
  </AbsoluteFill>
);

// The team's Monday screen (render at frame 430: ranked queue + "call these first").
export const StillDashboard: React.FC = () => (
  <AbsoluteFill>
    <Stage theme={THEMES.aurora} calm>
      <div style={{position: 'absolute', left: 60, top: 50}}>
        <Browser width={1480} lh={720} url="app.frontdesk.ai/queue">
          <Dashboard />
        </Browser>
      </div>
    </Stage>
  </AbsoluteFill>
);

// Ranked queue (render at frame 90).
export const StillQueue: React.FC = () => {
  const ids = ['james', 'daniel', 'sarah', 'mei', 'omar', 'priya'];
  const sorted = ['sarah', 'omar', 'priya', 'james', 'daniel', 'mei'];
  return (
    <AbsoluteFill>
      <Stage theme={T} calm>
        <div style={{position: 'absolute', left: 90, top: 80}}>
          <Queue theme={T} ids={ids} from={ids} to={sorted} at={0} width={1020} rowH={120} gap={18} scoreAt={0} tierAt={0} focusIds={['sarah', 'omar', 'priya']} focusAt={0} dimAfter={3} dimAt={0} />
        </div>
      </Stage>
    </AbsoluteFill>
  );
};

// Personal follow-up + agent alert (render at frame 90).
export const StillFollowUp: React.FC = () => (
  <AbsoluteFill>
    <Stage theme={T} calm>
      <div style={{position: 'absolute', left: 80, top: 90}}>
        <ChatCard
          theme={T} width={820} name="Sarah K." tone={0} status="WhatsApp · personal, automatic" size={32} readAt={0}
          messages={[
            {from: 'us', text: 'Hi Sarah, lovely to see you back on Penthouse 42A. Would a private viewing this Saturday suit you?', at: 0},
            {from: 'them', text: 'Yes please, 11 AM?', at: 10},
            {from: 'system', text: 'Viewing booked · Sat 11:00 AM', at: 20},
          ]}
        />
      </div>
      <div style={{position: 'absolute', left: 520, top: 610}}>
        <Toast theme={T} at={24} width={620} icon={<BellRing size={30} strokeWidth={2.4} />} title="Maya · hot lead" body="Sarah K. · 92 · wants a viewing" meta="now" color={T.hot} size={32} />
      </div>
    </Stage>
  </AbsoluteFill>
);
