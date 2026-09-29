// Intent scoring, shared by the browser (the live "What we see" panel), the Netlify Functions
// (lead scoring) and the admin dashboard, so every screen shows the same number.
//
// An event is a small object: {i: id, t: timestamp, type, ...}. cleanEvent() validates one from
// an untrusted source, applyEvent() folds it into a summary state, and scoreState() turns the
// state into a 0-100 score with the reason behind every point.

export const SECTIONS = {
  problem: 'The problem',
  how: 'How it works',
  product: 'The product',
  why: 'Why it matters',
  audit: 'The free audit',
  faq: 'Questions',
};
const SECTION_IDS = new Set(Object.keys(SECTIONS));
const SECTION_POINTS = {how: 8, product: 10, why: 6, faq: 6, audit: 10};
export const READ_MS = 3000; // time on a section before it counts as read

export const TYPES = ['visit', 'section', 'video', 'sound', 'cta', 'faq', 'form_start', 'scroll'];
const TYPE_SET = new Set(TYPES);

const DAY = 864e5;
const str = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n) : '');
const int = (v, lo, hi) => {
  const n = Number(v);
  return typeof v !== 'boolean' && v !== null && v !== '' && Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : null;
};
const id = () => Math.random().toString(36).slice(2, 10);

/** Validate and normalise one event. Returns null when it can't be used. */
export function cleanEvent(ev, now = Date.now()) {
  if (!ev || typeof ev !== 'object') return null;
  const type = str(ev.type, 20);
  if (!TYPE_SET.has(type)) return null;
  const out = {i: str(ev.i, 16) || id(), t: int(ev.t, now - 400 * DAY, now + DAY) ?? now, type};
  switch (type) {
    case 'visit':
      out.n = int(ev.n, 1, 999) ?? 1;
      out.ref = str(ev.ref, 60); // referrer host
      out.src = str(ev.src, 40); // utm_source
      out.med = str(ev.med, 40); // utm_medium
      out.cmp = str(ev.cmp, 60); // utm_campaign
      out.dev = ev.dev === 'mobile' ? 'mobile' : 'desktop';
      break;
    case 'section':
      if (!SECTION_IDS.has(ev.id)) return null;
      out.id = ev.id;
      out.ms = int(ev.ms, 0, 36e5) ?? 0;
      break;
    case 'video':
    case 'scroll':
      out.pct = int(ev.pct, 0, 100) ?? 0;
      break;
    case 'cta':
    case 'faq':
      out.label = str(ev.label, 80);
      if (!out.label) return null;
      break;
  }
  return out;
}

export function emptyState() {
  return {visits: 0, first: 0, last: 0, source: '', campaign: false, dev: '', sections: {}, video: 0, sound: false, ctas: [], faqs: [], formStarted: false, scroll: 0};
}

/** Fold one clean event into the state. Returns a new state. */
export function applyEvent(state, ev) {
  const s = {...state, sections: {...state.sections}, ctas: [...state.ctas], faqs: [...state.faqs]};
  s.first = s.first ? Math.min(s.first, ev.t) : ev.t;
  s.last = Math.max(s.last, ev.t);
  switch (ev.type) {
    case 'visit':
      s.visits = Math.max(s.visits, ev.n);
      if (!s.source) s.source = ev.src ? [ev.src, ev.med].filter(Boolean).join(' / ') : ev.ref || 'direct';
      if (ev.src) s.campaign = true;
      s.dev = ev.dev;
      break;
    case 'section':
      s.sections[ev.id] = (s.sections[ev.id] || 0) + ev.ms;
      break;
    case 'video':
      s.video = Math.max(s.video, ev.pct);
      break;
    case 'sound':
      s.sound = true;
      break;
    case 'cta':
      if (!s.ctas.includes(ev.label) && s.ctas.length < 10) s.ctas.push(ev.label);
      break;
    case 'faq':
      if (!s.faqs.includes(ev.label) && s.faqs.length < 10) s.faqs.push(ev.label);
      break;
    case 'form_start':
      s.formStarted = true;
      break;
    case 'scroll':
      s.scroll = Math.max(s.scroll, ev.pct);
      break;
  }
  return s;
}

/** Clean, de-duplicate (by event id), sort and fold a list of events. */
export function foldEvents(events, now = Date.now()) {
  const seen = new Set();
  const clean = [];
  for (const raw of events) {
    const ev = cleanEvent(raw, now);
    if (!ev || seen.has(ev.i)) continue;
    seen.add(ev.i);
    clean.push(ev);
  }
  clean.sort((a, b) => a.t - b.t);
  return {events: clean, state: clean.reduce(applyEvent, emptyState())};
}

export const tierOf = (score) => (score >= 70 ? 'Hot' : score >= 40 ? 'Warm' : 'Nurture');

/** The score, its tier and the reason behind every point. */
export function scoreState(s) {
  const parts = [];
  const add = (pts, label) => pts > 0 && parts.push({pts, label});
  const returns = Math.max(0, s.visits - 1);
  add(Math.min(20, returns * 10), returns > 1 ? `Came back ${returns} times` : 'Came back for a second visit');
  if (s.video >= 50) add(15, s.video >= 100 ? 'Watched the whole film with sound' : `Watched ${s.video}% of the film with sound`);
  if (s.sound) add(5, 'Turned the film sound on');
  for (const [key, pts] of Object.entries(SECTION_POINTS)) {
    if ((s.sections[key] || 0) >= READ_MS) add(pts, `Read "${SECTIONS[key]}"`);
  }
  add(Math.min(9, s.faqs.length * 3), s.faqs.length === 1 ? 'Opened a question in the FAQ' : `Opened ${s.faqs.length} questions in the FAQ`);
  add(Math.min(12, s.ctas.length * 6), s.ctas.length === 1 ? `Clicked "${s.ctas[0]}"` : `Clicked ${s.ctas.length} calls to action`);
  if (s.formStarted) add(10, 'Started the audit form');
  if (s.campaign) add(5, 'Arrived from one of our campaigns');
  const score = Math.min(100, parts.reduce((sum, p) => sum + p.pts, 0));
  return {score, tier: tierOf(score), parts};
}

/**
 * What the visitor explored, phrased so it can be mentioned back to them without feeling like
 * surveillance: content only, no visit counts, times of day or locations. Most-read first.
 */
export function behaviours(s) {
  const about = {
    problem: 'read about why serious buyers go unnoticed',
    how: 'spent time on how tracking, ranking and follow-up work',
    product: 'looked closely at the one-screen view of ranked buyers',
    why: 'read what changes when a sales team can see buyer intent',
    audit: 'read what the free lead-flow audit covers',
    faq: 'read the questions developers ask first',
  };
  const read = Object.entries(s.sections)
    .filter(([key, ms]) => ms >= READ_MS && about[key])
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => about[key]);
  const out = [];
  if (s.video >= 50) out.push('watched the 45-second film with the sound on');
  out.push(...read);
  for (const q of s.faqs.slice(0, 2)) out.push(`opened the FAQ question "${q}"`);
  return out.slice(0, 5);
}

const secs = (ms) => (ms >= 60000 ? `${Math.floor(ms / 60000)} min ${Math.round((ms % 60000) / 1000)} s` : `${Math.round(ms / 1000)} s`);

/** One human-readable line per event, for the live panel, the dashboard and the owner brief. */
export function eventLabel(ev) {
  switch (ev.type) {
    case 'visit': {
      const from = ev.src ? [ev.src, ev.med].filter(Boolean).join(' / ') : ev.ref || 'a direct visit';
      return ev.n > 1 ? `Came back (visit ${ev.n}) from ${from}` : `Arrived from ${from} on ${ev.dev}`;
    }
    case 'section':
      return `Read "${SECTIONS[ev.id] || ev.id}" for ${secs(ev.ms)}`;
    case 'video':
      return ev.pct >= 100 ? 'Watched the whole film' : `Watched ${ev.pct}% of the film`;
    case 'sound':
      return 'Turned the film sound on';
    case 'cta':
      return `Clicked "${ev.label}"`;
    case 'faq':
      return `Opened "${ev.label}"`;
    case 'form_start':
      return 'Started the audit form';
    case 'scroll':
      return ev.pct >= 100 ? 'Reached the end of the page' : `Scrolled ${ev.pct}% of the page`;
    default:
      return ev.type;
  }
}

/** Display lines, oldest first, with back-to-back reads of the same section merged into one. */
export function timeline(events) {
  const out = [];
  for (const ev of events) {
    const prev = out[out.length - 1];
    if (prev && ev.type === 'section' && prev.ev.type === 'section' && prev.ev.id === ev.id) {
      prev.ev = {...prev.ev, ms: prev.ev.ms + ev.ms};
      continue;
    }
    out.push({t: ev.t, ev});
  }
  return out.map(({t, ev}) => ({t, type: ev.type, label: eventLabel(ev)}));
}
