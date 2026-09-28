// POST /api/track: a batch of events from a visitor who opted in to the live demo.
// Body: {vid, events: [...]}, or {vid, forget: true} to delete everything about that browser.
import type {Config, Context} from '@netlify/functions';
import {applyEvent, cleanEvent, emptyState, scoreState} from '../../public/assets/score.js';
import {K, db, forgetVisitor} from '../lib/store.mts';
import {isBot, isVid, rid, today} from '../lib/guard.mts';

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', {status: 405});
  const raw = await req.text();
  if (raw.length > 32_000) return new Response(null, {status: 413});
  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, {status: 400});
  }
  if (!isVid(body?.vid)) return new Response(null, {status: 400});
  const vid: string = body.vid;
  const store = db(context);

  if (body.forget === true) {
    await forgetVisitor(store, vid);
    return new Response(null, {status: 204});
  }
  if (isBot(req.headers.get('user-agent') ?? '')) return new Response(null, {status: 204});

  const now = Date.now();
  const events = (Array.isArray(body.events) ? body.events.slice(0, 60) : []).map((e: unknown) => cleanEvent(e, now)).filter(Boolean);
  if (!events.length) return new Response(null, {status: 204});

  // The running summary lets the dashboard list visitors without replaying every event.
  const meta: any = (await store.get(K.visitor(vid), {type: 'json'})) ?? {vid, first: now};
  let state = meta.state ?? emptyState();
  for (const ev of events) state = applyEvent(state, ev);
  const {score, tier} = scoreState(state);
  const date = today();
  const days: string[] = Array.isArray(meta.days) ? meta.days : [];
  const newDay = !days.includes(date);
  const geo = meta.geo ?? {city: context.geo?.city ?? '', country: context.geo?.country?.code ?? ''};

  await Promise.all([
    store.setJSON(`${K.events(vid)}${now}-${rid()}`, events),
    store.setJSON(K.visitor(vid), {...meta, last: now, state, score, tier, geo, days: newDay ? [...days, date].slice(-60) : days}),
    newDay ? store.set(K.day(date, vid), '') : null,
  ]);
  return new Response(null, {status: 204});
};

export const config: Config = {path: '/api/track'};
