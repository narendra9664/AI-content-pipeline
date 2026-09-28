// POST /api/lead: the audit form. Scores the visit, has Gemini write a personal reply, emails it
// from the owner's Gmail, stores the lead and sends the owner a brief. Netlify stops a function
// after 10 s, so Gemini gets 4.5 s and the brief is sent after the response.
import type {Config, Context} from '@netlify/functions';
import {behaviours, foldEvents, scoreState, timeline} from '../../public/assets/score.js';
import {K, bump, count, db, loadEvents} from '../lib/store.mts';
import {clock, cleanLead, firstName, isVid, rid, sha256, stripLinks, today, waLink} from '../lib/guard.mts';
import {postscript, templateReply, writeReply, type ReplyResult} from '../lib/gemini.mts';
import {mailConfigured, sendMail, type Sent} from '../lib/mail.mts';

// Per network rather than per person: mobile carriers put many phones behind one IP address.
const LIMITS = {perIp: 5, perDay: 40};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {status, headers: {'content-type': 'application/json'}});

export default async (req: Request, context: Context) => {
  const t0 = Date.now();
  if (req.method !== 'POST') return json({ok: false}, 405);
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ok: false, error: 'json'}, 400);
  }
  const parsed = cleanLead(body);
  if (!parsed.ok) return json({ok: false, error: parsed.error}, 400);
  const lead = parsed.lead;

  // A filled honeypot, or a form completed faster than a person can type: answer politely, do nothing.
  if (body['company-url'] || !(Number(body.elapsed) >= 4000)) return json({ok: true, demo: false});

  const store = db(context, true);
  const date = today();
  const keys = {
    ip: context.ip ? K.rl('ip', date, sha256(`${context.ip}|${date}`).slice(0, 24)) : '',
    email: K.rl('email', date, sha256(lead.email).slice(0, 24)),
    all: K.rl('all', date, 'all'),
  };
  const vid: string | null = isVid(body.vid) ? body.vid : null;
  const [ipCount, emailCount, allCount, stored, meta] = await Promise.all([
    keys.ip ? count(store, keys.ip) : Promise.resolve(0),
    count(store, keys.email),
    count(store, keys.all),
    vid ? loadEvents(store, vid) : Promise.resolve([]),
    vid ? store.get(K.visitor(vid), {type: 'json'}) : Promise.resolve(null),
  ]);

  // 1. The visit: everything the server recorded, plus events the browser hadn't sent yet.
  const fromBrowser = Array.isArray(body.events) ? body.events.slice(-200) : [];
  const {events, state} = foldEvents(vid ? [...stored, ...fromBrowser] : []);
  const loadMs = Date.now() - t0;
  const {score, tier, parts} = scoreState(state);
  const facts = behaviours(state);

  // 2. Limits. Looks like abuse: keep the lead, send nothing. A repeat: no second auto-reply today.
  const abuse = ipCount >= LIMITS.perIp || allCount >= LIMITS.perDay;
  const skip = abuse ? 'daily limit reached' : emailCount >= 1 ? 'already replied today' : mailConfigured() ? '' : 'Gmail is not set up';

  // 3. The reply. Form fields are stripped of links so nobody can use this to send spam.
  const input = {
    firstName: firstName(stripLinks(lead.name)),
    company: stripLinks(lead.company) || 'your team',
    website: stripLinks(lead.website),
    volume: lead.volume,
    score,
    tier,
    behaviours: facts,
    signals: parts.map((p: any) => `${p.label} (+${p.pts})`),
  };
  const ai: ReplyResult = skip ? {ok: false, reason: skip, ms: 0} : await writeReply(input);
  const reply = ai.ok ? ai.reply : templateReply(input);

  // 4. Send it, with a P.S. that states the real elapsed time.
  let sent: Sent = {ok: false, ms: 0, error: skip};
  let text = reply.body;
  if (!skip) {
    const secs = Math.max(1, Math.round((Date.now() - t0) / 1000));
    text = `${reply.body}\n\n${postscript(ai.ok, secs, ai.ok && facts.length > 0)}`;
    sent = await sendMail({to: lead.email, subject: reply.subject, text, replyTo: Netlify.env.get('GMAIL_USER')});
  }
  const totalMs = Date.now() - t0;

  const id = `${Date.now()}-${rid()}`;
  const record = {
    id,
    createdAt: t0,
    status: 'new',
    ...lead,
    vid,
    score,
    tier,
    parts,
    facts,
    source: state.source || meta?.state?.source || '',
    geo: meta?.geo ?? {city: context.geo?.city ?? '', country: context.geo?.country?.code ?? ''},
    dev: state.dev,
    visits: state.visits,
    tracked: events.length,
    reply: {
      subject: reply.subject,
      body: text,
      by: ai.ok ? `Gemini (${ai.model})` : 'template',
      note: ai.ok ? '' : ai.reason,
      emailed: sent.ok,
      error: sent.ok ? '' : sent.error ?? '',
      writeMs: ai.ms,
      sendMs: sent.ms,
      totalMs,
    },
    brief: reply.brief,
  };
  await Promise.all([
    store.setJSON(K.lead(id), record),
    keys.ip ? bump(store, keys.ip, ipCount) : null,
    bump(store, keys.all, allCount),
    sent.ok ? bump(store, keys.email, emailCount) : null,
  ]);

  // 5. After the response: link the visitor to the lead and brief the owner.
  const later = Promise.all([
    vid && meta ? store.setJSON(K.visitor(vid), {...(meta as object), lead: id, name: lead.name, company: lead.company}) : null,
    abuse ? null : sendOwnerBrief(record, events),
  ]);
  if (typeof context.waitUntil === 'function') context.waitUntil(later);
  else await later;

  return json({
    ok: true,
    demo: true,
    tracked: events.length > 0,
    score,
    tier,
    emailed: sent.ok,
    reason: sent.ok ? '' : skip || 'send failed',
    ai: ai.ok ? 'gemini' : 'template',
    sentTo: lead.email,
    timings: {load: loadMs, write: ai.ms, send: sent.ms, total: totalMs},
  });
};

type LeadRecord = {
  [key: string]: any;
  reply: {subject: string; body: string; by: string; note: string; emailed: boolean; error: string; totalMs: number};
};

async function sendOwnerBrief(r: LeadRecord, events: any[]) {
  const to = Netlify.env.get('OWNER_EMAIL') || Netlify.env.get('GMAIL_USER');
  if (!to || !mailConfigured()) return;
  const tz = Netlify.env.get('OWNER_TZ') || 'Asia/Kolkata';
  const site = (Netlify.env.get('SITE_URL') || '').replace(/\/$/, '');
  const wa = waLink(r.phone);
  const place = [r.geo?.city, r.geo?.country].filter(Boolean).join(', ');
  const lines = timeline(events).map((l) => `${clock(l.t, tz)}  ${l.label}`);
  const text = [
    `${r.tier} lead, ${r.score}/100`,
    `${r.name}, ${r.company}`,
    '',
    `Email: ${r.email}`,
    `Phone / WhatsApp: ${r.phone || 'not given'}${wa ? `  (WhatsApp: ${wa})` : ''}`,
    `Website: ${r.website || 'not given'}`,
    `Enquiries per month: ${r.volume}`,
    `Came from: ${r.source || 'unknown'}${place ? `, ${place}` : ''}${r.dev ? `, on ${r.dev}` : ''}`,
    '',
    'Why this score:',
    ...(r.parts.length ? r.parts.map((p: any) => `+${p.pts}  ${p.label}`) : ['Nothing tracked: they declined the live demo, or nothing was recorded.']),
    '',
    ...(lines.length ? ['What they did:', ...lines.slice(-25), ''] : []),
    r.reply.emailed
      ? `The reply they got (${r.reply.by}, sent ${(r.reply.totalMs / 1000).toFixed(1)} s after they pressed the button):`
      : `No automatic reply was sent (${r.reply.error || r.reply.note}). Here is a draft you can send yourself:`,
    '',
    `Subject: ${r.reply.subject}`,
    '',
    r.reply.body,
    '',
    'Brief:',
    r.brief,
    '',
    ...(site ? [`Dashboard: ${site}/admin/`] : []),
    'When they reply with times, answer within 5 minutes. Your speed is the demo.',
  ].join('\n');
  await sendMail({to, subject: `${r.tier} lead (${r.score}): ${r.company}, ${r.name}`, text});
}

export const config: Config = {path: '/api/lead'};
