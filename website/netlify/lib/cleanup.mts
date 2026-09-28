// Retention (the promise on privacy.html): browsing data from visitors who never requested an
// audit goes after 30 days, leads after 12 months, rate-limit counters after 2 days.
import {K, forgetVisitor, removePrefix} from './store.mts';

const DAY = 864e5;

// Folder listings may come back as full paths ("days/2026-09-28") or bare names; use the last part.
const lastPart = (dir: string) => dir.split('/').filter(Boolean).pop() ?? '';

type Stats = {visitors: number; leads: number; counters: number; finished: boolean};

/** Stops early when `timeLeft()` says so; the next run carries on where this one stopped. */
export async function cleanup(store: any, now = Date.now(), timeLeft = () => true): Promise<Stats> {
  const stats: Stats = {visitors: 0, leads: 0, counters: 0, finished: false};

  // Visitors: walk the per-day index, oldest days first.
  const visitorCutoff = now - 30 * DAY;
  const {directories: days} = await store.list({prefix: 'days/', directories: true});
  for (const date of days.map(lastPart).sort()) {
    if (!(Date.parse(date) < visitorCutoff - DAY)) break;
    const {blobs} = await store.list({prefix: `days/${date}/`});
    for (const b of blobs) {
      const vid = lastPart(b.key);
      const meta: any = await store.get(K.visitor(vid), {type: 'json'});
      if (meta && !meta.lead && meta.last < visitorCutoff) {
        await forgetVisitor(store, vid);
        stats.visitors++;
      }
      await store.delete(b.key);
      if (!timeLeft()) return stats;
    }
  }

  // Leads older than a year, with their browsing data. Keys start with the creation time.
  const leadCutoff = now - 365 * DAY;
  const {blobs: leads} = await store.list({prefix: 'leads/'});
  for (const b of leads) {
    if (Number(lastPart(b.key).split('-')[0]) >= leadCutoff) continue;
    const lead: any = await store.get(b.key, {type: 'json'});
    if (lead?.vid) await forgetVisitor(store, lead.vid);
    await store.delete(b.key);
    stats.leads++;
    if (!timeLeft()) return stats;
  }

  // Rate-limit counters: rl/{kind}/{date}/{hash}
  const counterCutoff = now - 2 * DAY;
  const {directories: kinds} = await store.list({prefix: 'rl/', directories: true});
  for (const kind of kinds.map(lastPart)) {
    const {directories: dates} = await store.list({prefix: `rl/${kind}/`, directories: true});
    for (const date of dates.map(lastPart)) {
      if (Date.parse(date) < counterCutoff) stats.counters += await removePrefix(store, `rl/${kind}/${date}/`);
      if (!timeLeft()) return stats;
    }
  }
  stats.finished = true;
  return stats;
}
