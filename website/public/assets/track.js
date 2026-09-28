// The live demo on our own site: consent, visitor tracking and the "What we see" panel.
// Nothing is recorded until the visitor taps "Show me". Events are kept in this browser (so the
// panel updates instantly and remembers return visits) and sent in small batches to /api/track.
// Browsers that send Global Privacy Control are never asked; the footer link still lets them opt in.
import {SECTIONS, cleanEvent, foldEvents, scoreState, timeline} from './score.js';

const KEY = {consent: 'fd_consent', vid: 'fd_vid', events: 'fd_events', last: 'fd_last', visits: 'fd_visits'};
const SESSION_GAP = 30 * 60 * 1000;
const MAX_LOCAL = 400;
const $ = (id) => document.getElementById(id);

const ls = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
  del: (k) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16));
const rid = () => Math.random().toString(36).slice(2, 10);

let tracking = false;
let vid = null;
let log = []; // every event for this browser
let queue = []; // events not sent yet
let panelOpen = false;

const ui = {
  consent: $('fdConsent'),
  pill: $('fdPill'),
  pillScore: $('fdPillScore'),
  panel: $('fdPanel'),
  score: $('fdScore'),
  tier: $('fdTier'),
  ring: $('fdRing'),
  parts: $('fdParts'),
  timeline: $('fdTimeline'),
  toast: $('fdToast'),
};

/* ---------- recording ---------- */

function record(type, data = {}) {
  if (!tracking) return;
  const ev = cleanEvent({i: rid(), t: Date.now(), type, ...data});
  if (!ev) return;
  log.push(ev);
  queue.push(ev);
  if (log.length > MAX_LOCAL) log = log.slice(-MAX_LOCAL);
  ls.set(KEY.events, JSON.stringify(log));
  ls.set(KEY.last, String(ev.t));
  render();
}

function send(beacon = false) {
  if (!tracking || !queue.length) return;
  const body = JSON.stringify({vid, events: queue.splice(0, 60)});
  if (beacon && navigator.sendBeacon) {
    navigator.sendBeacon('/api/track', new Blob([body], {type: 'application/json'}));
    return;
  }
  fetch('/api/track', {method: 'POST', headers: {'Content-Type': 'application/json'}, body, keepalive: true}).catch(() => {});
}

// A new visit starts after 30 minutes without activity.
function startVisit() {
  const last = Number(ls.get(KEY.last) || 0);
  if (last && Date.now() - last < SESSION_GAP) return;
  const n = Number(ls.get(KEY.visits) || 0) + 1;
  ls.set(KEY.visits, String(n));
  const q = new URLSearchParams(location.search);
  let ref = '';
  try {
    ref = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
  } catch {}
  if (ref === location.hostname) ref = '';
  record('visit', {
    n,
    ref,
    src: q.get('utm_source') || '',
    med: q.get('utm_medium') || '',
    cmp: q.get('utm_campaign') || '',
    dev: matchMedia('(max-width: 760px)').matches ? 'mobile' : 'desktop',
  });
}

// Time spent on each section: a section counts while it crosses the middle of the screen.
// Short stretches add up (scrolling back and forth), and are reported once they reach 2 s.
const inView = new Set();
const dwellStart = {};
const pending = {};
function flushDwell(id, restart) {
  const start = dwellStart[id];
  if (start) {
    pending[id] = (pending[id] || 0) + (Date.now() - start);
    delete dwellStart[id];
    if (restart) dwellStart[id] = Date.now();
  }
  if ((pending[id] || 0) >= 2000) {
    record('section', {id, ms: pending[id]});
    pending[id] = 0;
  }
}
const flushAll = (restart) => Object.keys(dwellStart).forEach((id) => flushDwell(id, restart));

function watchSections() {
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        const id = en.target.id;
        if (en.isIntersecting) {
          inView.add(id);
          if (document.visibilityState === 'visible') dwellStart[id] ||= Date.now();
        } else {
          inView.delete(id);
          flushDwell(id, false);
        }
      }
    },
    {rootMargin: '-45% 0px -45% 0px'},
  );
  for (const id of Object.keys(SECTIONS)) {
    const el = $(id);
    if (el) io.observe(el);
  }
}

// The film autoplays muted, so only watching with the sound on counts.
function watchFilm() {
  const v = $('heroVideo');
  if (!v) return;
  let watched = 0;
  let lastT = v.currentTime;
  let soundSent = false;
  const marks = new Set();
  v.addEventListener('volumechange', () => {
    if (!v.muted && !soundSent) {
      soundSent = true;
      record('sound');
    }
  });
  v.addEventListener('timeupdate', () => {
    const t = v.currentTime;
    const d = t - lastT;
    lastT = t;
    if (v.muted || v.paused || d <= 0 || d > 1.5 || !v.duration) return;
    watched += d;
    const pct = Math.min(100, Math.round((watched / v.duration) * 100));
    for (const m of [25, 50, 75, 100]) {
      if (pct >= m && !marks.has(m)) {
        marks.add(m);
        record('video', {pct: m});
      }
    }
  });
}

function watchClicks() {
  const clicked = new Set();
  document.addEventListener('click', (e) => {
    const el = e.target.closest('a.btn, button.btn');
    if (!el || el.closest('#auditForm, #fdPanel, #fdConsent')) return;
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    if (label && !clicked.has(label)) {
      clicked.add(label);
      record('cta', {label});
    }
  });
  document.addEventListener(
    'toggle',
    (e) => {
      const d = e.target;
      if (!(d instanceof HTMLDetailsElement) || !d.open) return;
      const s = d.querySelector('summary');
      const label = s ? [...s.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim() : '';
      if (label) record('faq', {label});
    },
    true,
  );
  let formStarted = false;
  $('auditForm')?.addEventListener('focusin', () => {
    if (!formStarted) {
      formStarted = true;
      record('form_start');
    }
  });
  const marks = new Set();
  let ticking = false;
  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      setTimeout(() => {
        ticking = false;
        const h = document.documentElement;
        const pct = Math.round(((scrollY + innerHeight) / h.scrollHeight) * 100);
        for (const m of [50, 100]) {
          if (pct >= m - 1 && !marks.has(m)) {
            marks.add(m);
            record('scroll', {pct: m});
          }
        }
      }, 400);
    },
    {passive: true},
  );
}

let wired = false;
function start() {
  if (tracking) return;
  tracking = true;
  vid = ls.get(KEY.vid) || uuid();
  ls.set(KEY.vid, vid);
  try {
    log = JSON.parse(ls.get(KEY.events) || '[]').filter((e) => e && e.i);
  } catch {
    log = [];
  }
  startVisit();
  ui.pill.classList.remove('hidden');
  render();
  if (wired) return; // opted out and back in: the listeners below are already running
  wired = true;
  watchSections();
  watchFilm();
  watchClicks();
  setInterval(() => {
    flushAll(true);
    send();
  }, 10000);
  setInterval(() => panelOpen && flushAll(true), 3000);
  addEventListener('pagehide', () => {
    flushAll(false);
    send(true);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAll(false);
      send(true);
    } else {
      for (const id of inView) dwellStart[id] ||= Date.now();
    }
  });
}

/* ---------- consent ---------- */

function showConsent() {
  ui.consent.classList.remove('hidden');
  requestAnimationFrame(() => ui.consent.classList.add('in'));
}
function hideConsent() {
  ui.consent.classList.remove('in');
  setTimeout(() => ui.consent.classList.add('hidden'), 300);
}
ui.consent.addEventListener('click', (e) => {
  const b = e.target.closest('[data-consent]');
  if (!b) return;
  const yes = b.dataset.consent === 'yes';
  ls.set(KEY.consent, yes ? 'yes' : 'no');
  hideConsent();
  if (yes) {
    start();
    ui.pill.classList.add('hello');
    toast('Live demo on. Tap the score to see what our system sees.');
    setTimeout(() => ui.pill.classList.remove('hello'), 4000);
  }
});
$('fdOptIn')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (tracking) openPanel();
  else showConsent();
});

/* ---------- panel ---------- */

function openPanel() {
  flushAll(true);
  panelOpen = true;
  ui.panel.classList.add('open');
  ui.panel.setAttribute('aria-hidden', 'false');
  ui.pill.setAttribute('aria-expanded', 'true');
  render();
}
function closePanel() {
  panelOpen = false;
  ui.panel.classList.remove('open');
  ui.panel.setAttribute('aria-hidden', 'true');
  ui.pill.setAttribute('aria-expanded', 'false');
}
ui.pill.addEventListener('click', () => (panelOpen ? closePanel() : openPanel()));
$('fdClose').addEventListener('click', closePanel);
$('fdPanelCta').addEventListener('click', closePanel);
addEventListener('keydown', (e) => e.key === 'Escape' && panelOpen && closePanel());

$('fdForget').addEventListener('click', () => {
  if (vid) {
    fetch('/api/track', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({vid, forget: true}), keepalive: true}).catch(() => {});
  }
  for (const k of Object.values(KEY)) ls.del(k);
  ls.set(KEY.consent, 'no');
  tracking = false;
  vid = null;
  log = [];
  queue = [];
  closePanel();
  ui.pill.classList.add('hidden');
  toast('Tracking stopped. Everything we recorded about this browser is deleted.');
});

let toastTimer;
function toast(text) {
  ui.toast.textContent = text;
  ui.toast.classList.add('in');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('in'), 4200);
}

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const when = (t) => {
  const d = new Date(t);
  const time = d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  return d.toDateString() === new Date().toDateString() ? time : `${d.toLocaleDateString([], {day: 'numeric', month: 'short'})}, ${time}`;
};

function render() {
  if (!tracking) return;
  const {events, state} = foldEvents(log);
  const {score, tier, parts} = scoreState(state);
  ui.pillScore.textContent = score;
  ui.pill.dataset.tier = tier.toLowerCase();
  if (!panelOpen) return;
  ui.panel.dataset.tier = tier.toLowerCase();
  ui.score.textContent = score;
  ui.tier.textContent = tier;
  ui.ring.style.strokeDashoffset = String(302 - (302 * score) / 100);
  ui.parts.replaceChildren(
    ...(parts.length
      ? parts.map((p) => {
          const li = el('li');
          li.append(el('b', '', `+${p.pts}`), el('span', '', p.label));
          return li;
        })
      : [el('li', 'empty', 'Nothing yet. Scroll, watch the film with sound, or open a question.')]),
  );
  const lines = timeline(events).slice(-30).reverse();
  ui.timeline.replaceChildren(
    ...lines.map((l) => {
      const li = el('li');
      li.append(el('time', '', when(l.t)), el('span', '', l.label));
      return li;
    }),
  );
}

/* ---------- for the audit form ---------- */

window.fdTrack = {
  active: () => tracking,
  vid: () => (tracking ? vid : null),
  events: () => (tracking ? log.slice(-200) : []),
  flush: () => {
    flushAll(true);
    send();
  },
};

/* ---------- boot ---------- */

const choice = ls.get(KEY.consent);
if (choice === 'yes') start();
else if (!choice && !navigator.globalPrivacyControl) setTimeout(showConsent, 1200);
