// /api/admin: the owner's dashboard API. Every call needs "Authorization: Bearer <ADMIN_KEY>".
//   GET  ?view=leads                      every lead, newest first
//   GET  ?view=lead&id=...                one lead with its full timeline
//   GET  ?view=visitors                   everyone seen in the last 24 hours
//   POST {action: 'status', id, status}   new | replied | booked | lost
//   POST {action: 'delete', id}           delete a lead and its browsing data (deletion requests)
import type {Config, Context} from '@netlify/functions';
import {foldEvents, scoreState, timeline} from '../../public/assets/score.js';
import {K, bump, count, db, forgetVisitor, loadEvents} from '../lib/store.mts';
import {safeEqual, sha256, today} from '../lib/guard.mts';

type Store = ReturnType<typeof db>;
const STATUSES = ['new', 'replied', 'booked', 'lost'];
const LEAD_ID = /^\d{13}-[a-z0-9]{1,12}$/;
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {status, headers: {'content-type': 'application/json', 'cache-control': 'no-store'}});

export default async (req: Request, context: Context) => {
  const secret = Netlify.env.get('ADMIN_KEY');
  if (!secret) return json({error: 'Add ADMIN_KEY in Netlify (Project configuration → Environment variables) to use the dashboard.'}, 503);

  // Slow down password guessing: 20 wrong tries locks an IP out until tomorrow (UTC).
  const store = db(context, true);
  const date = today();
  const failKey = K.rl('admin', date, sha256(`${context.ip}|${date}`).slice(0, 24));
  const fails = await count(store, failKey);
  if (fails >= 20) return json({error: 'Too many wrong passwords today. Try again tomorrow.'}, 429);
  const auth = req.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ') || !safeEqual(auth.slice(7), secret)) {
    await bump(store, failKey, fails);
    return json({error: 'Wrong password.'}, 401);
  }

  if (req.method === 'GET') {
    const url = new URL(req.url);
    const view = url.searchParams.get('view') ?? 'leads';
    if (view === 'leads') return json({leads: await listLeads(store)});
    if (view === 'visitors') return json({visitors: await recentVisitors(store)});
    if (view === 'lead') {
      const id = url.searchParams.get('id') ?? '';
      const lead: any = LEAD_ID.test(id) ? await store.get(K.lead(id), {type: 'json'}) : null;
      if (!lead) return json({error: 'Not found'}, 404);
      const {events} = foldEvents(lead.vid ? await loadEvents(store, lead.vid) : []);
      return json({lead, timeline: timeline(events)});
    }
    return json({error: 'Unknown view'}, 400);
  }

  if (req.method === 'POST') {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({error: 'Bad JSON'}, 400);
    }
    const id = String(body?.id ?? '');
    const lead: any = LEAD_ID.test(id) ? await store.get(K.lead(id), {type: 'json'}) : null;
    if (!lead) return json({error: 'Not found'}, 404);
    if (body.action === 'status' && STATUSES.includes(body.status)) {
      await store.setJSON(K.lead(id), {...lead, status: body.status, statusAt: Date.now()});
      return json({ok: true});
    }
    if (body.action === 'delete') {
      if (lead.vid) await forgetVisitor(store, lead.vid);
      await store.delete(K.lead(id));
      return json({ok: true});
    }
    return json({error: 'Unknown action'}, 400);
  }
  return json({error: 'Method not allowed'}, 405);
};

async function listLeads(store: Store) {
  const {blobs} = await store.list({prefix: 'leads/'});
  const keys = blobs.map((b) => b.key).sort().reverse().slice(0, 300);
  const leads = await Promise.all(keys.map((key) => store.get(key, {type: 'json'})));
  return leads.filter(Boolean);
}

async function recentVisitors(store: Store) {
  const since = Date.now() - 864e5;
  const days = [today(), today(new Date(since))];
  const lists = await Promise.all([...new Set(days)].map((d) => store.list({prefix: `days/${d}/`})));
  const vids = [...new Set(lists.flatMap((l) => l.blobs.map((b) => b.key.split('/').pop() as string)))];
  const metas: any[] = await Promise.all(vids.slice(0, 300).map((vid) => store.get(K.visitor(vid), {type: 'json'})));
  return metas
    .filter((m) => m && m.last >= since)
    .map((m) => ({
      vid: m.vid,
      last: m.last,
      first: m.first,
      score: m.score,
      tier: m.tier,
      geo: m.geo,
      dev: m.state?.dev ?? '',
      source: m.state?.source ?? '',
      visits: m.state?.visits ?? 1,
      reasons: scoreState(m.state).parts.slice(0, 3).map((p: any) => p.label),
      lead: m.lead ?? null,
      name: m.name ?? '',
      company: m.company ?? '',
    }))
    .sort((a, b) => b.score - a.score || b.last - a.last);
}

export const config: Config = {path: '/api/admin'};
