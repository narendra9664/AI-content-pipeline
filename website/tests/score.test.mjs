import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanEvent, applyEvent, emptyState, foldEvents, scoreState, behaviours, eventLabel, tierOf} from '../public/assets/score.js';

const NOW = Date.UTC(2026, 8, 28, 12);
const ev = (type, extra = {}, t = NOW) => ({i: Math.random().toString(36).slice(2, 10), t, type, ...extra});

test('cleanEvent rejects unknown types, bad sections and prototype keys', () => {
  assert.equal(cleanEvent({type: 'purchase'}, NOW), null);
  assert.equal(cleanEvent({type: 'section', id: 'pricing', ms: 5000}, NOW), null);
  assert.equal(cleanEvent({type: 'section', id: 'constructor', ms: 5000}, NOW), null);
  assert.equal(cleanEvent({type: 'section', id: '__proto__', ms: 5000}, NOW), null);
  assert.equal(cleanEvent({type: 'cta', label: '   '}, NOW), null);
  assert.equal(cleanEvent(null, NOW), null);
  assert.equal(cleanEvent('visit', NOW), null);
});

test('cleanEvent clamps numbers, strips markup and bounds timestamps', () => {
  const s = cleanEvent({type: 'section', id: 'how', ms: 9e12, t: NOW + 30 * 864e5}, NOW);
  assert.equal(s.ms, 36e5);
  assert.equal(s.t, NOW + 864e5);
  const c = cleanEvent({type: 'cta', label: '<b>Book</b>\n  now' + 'x'.repeat(200)}, NOW);
  assert.ok(!c.label.includes('<') && !c.label.includes('\n'));
  assert.ok(c.label.length <= 80);
  const v = cleanEvent({type: 'video', pct: 'lots'}, NOW);
  assert.equal(v.pct, 0);
  assert.equal(cleanEvent({type: 'visit', n: true}, NOW).n, 1);
});

test('an empty state scores zero and is Nurture', () => {
  const r = scoreState(emptyState());
  assert.deepEqual(r, {score: 0, tier: 'Nurture', parts: []});
});

test('each signal adds its points, with caps', () => {
  let s = emptyState();
  s = applyEvent(s, cleanEvent(ev('visit', {n: 4, src: 'linkedin', med: 'dm', dev: 'mobile'}), NOW));
  s = applyEvent(s, cleanEvent(ev('sound'), NOW));
  s = applyEvent(s, cleanEvent(ev('video', {pct: 50}), NOW));
  s = applyEvent(s, cleanEvent(ev('section', {id: 'how', ms: 2500}), NOW));
  s = applyEvent(s, cleanEvent(ev('section', {id: 'how', ms: 1000}), NOW)); // 3.5 s in total: read
  s = applyEvent(s, cleanEvent(ev('section', {id: 'product', ms: 2000}), NOW)); // not read yet
  for (const q of ['a', 'b', 'c', 'd']) s = applyEvent(s, cleanEvent(ev('faq', {label: q}), NOW));
  s = applyEvent(s, cleanEvent(ev('cta', {label: 'Book a free audit'}), NOW));
  s = applyEvent(s, cleanEvent(ev('cta', {label: 'Book a free audit'}), NOW)); // same CTA twice counts once
  s = applyEvent(s, cleanEvent(ev('form_start'), NOW));
  const {score, parts} = scoreState(s);
  const pts = Object.fromEntries(parts.map((p) => [p.label, p.pts]));
  assert.equal(pts['Came back 3 times'], 20); // capped at 20
  assert.equal(pts['Watched 50% of the film with sound'], 15);
  assert.equal(pts['Turned the film sound on'], 5);
  assert.equal(pts['Read "How it works"'], 8);
  assert.equal(pts['Read "The product"'], undefined);
  assert.equal(pts['Opened 4 questions in the FAQ'], 9); // capped at 9
  assert.equal(pts['Clicked "Book a free audit"'], 6);
  assert.equal(pts['Started the audit form'], 10);
  assert.equal(pts['Arrived from one of our campaigns'], 5);
  assert.equal(score, 20 + 15 + 5 + 8 + 9 + 6 + 10 + 5);
  assert.equal(s.source, 'linkedin / dm');
});

test('the score never exceeds 100', () => {
  const events = [ev('visit', {n: 9, src: 'x'}), ev('sound'), ev('video', {pct: 100}), ev('form_start')];
  for (const id of ['how', 'product', 'why', 'faq', 'audit']) events.push(ev('section', {id, ms: 60000}));
  for (let k = 0; k < 5; k++) events.push(ev('faq', {label: `q${k}`}), ev('cta', {label: `c${k}`}));
  const {state} = foldEvents(events, NOW);
  const r = scoreState(state);
  assert.equal(r.score, 100);
  assert.equal(r.tier, 'Hot');
});

test('foldEvents drops duplicates and invalid events, and sorts by time', () => {
  const a = ev('visit', {n: 1}, NOW - 5000);
  const b = ev('section', {id: 'why', ms: 4000}, NOW - 1000);
  const {events, state} = foldEvents([b, a, a, {type: 'bogus'}, b], NOW);
  assert.equal(events.length, 2);
  assert.equal(events[0].type, 'visit');
  assert.equal(state.sections.why, 4000); // counted once despite the duplicate
});

test('tiers switch at 40 and 70', () => {
  assert.equal(tierOf(39), 'Nurture');
  assert.equal(tierOf(40), 'Warm');
  assert.equal(tierOf(69), 'Warm');
  assert.equal(tierOf(70), 'Hot');
});

test('behaviours mention content only, most-read first', () => {
  const {state} = foldEvents([
    ev('visit', {n: 3, src: 'linkedin'}),
    ev('section', {id: 'why', ms: 4000}),
    ev('section', {id: 'product', ms: 20000}),
    ev('section', {id: 'faq', ms: 1000}),
    ev('video', {pct: 75}),
    ev('faq', {label: 'Will the follow-ups sound automated?'}),
  ], NOW);
  const b = behaviours(state);
  assert.equal(b[0], 'watched the 50-second film with the sound on');
  assert.equal(b[1], 'looked closely at the one-screen view of ranked buyers');
  assert.equal(b[2], 'read what changes when a sales team can see buyer intent');
  assert.ok(b.includes('opened the FAQ question "Will the follow-ups sound automated?"'));
  assert.ok(!b.some((x) => /visit|linkedin|came back|\d{1,2}:\d{2}/i.test(x)));
});

test('eventLabel describes every event type', () => {
  assert.equal(eventLabel({type: 'visit', n: 1, src: 'linkedin', med: 'dm', dev: 'mobile'}), 'Arrived from linkedin / dm on mobile');
  assert.equal(eventLabel({type: 'visit', n: 2, ref: 'google.com'}), 'Came back (visit 2) from google.com');
  assert.equal(eventLabel({type: 'section', id: 'how', ms: 72000}), 'Read "How it works" for 1 min 12 s');
  assert.equal(eventLabel({type: 'video', pct: 100}), 'Watched the whole film');
  assert.equal(eventLabel({type: 'faq', label: 'Q?'}), 'Opened "Q?"');
});
