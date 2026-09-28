// Netlify Blobs storage. Production traffic goes to one site-wide store; every other context
// (netlify dev, deploy previews) gets a deploy-scoped store, so test data never mixes with real
// visitors.
//
// Keys:
//   visitors/{vid}              running summary: state, score, geo, source, days seen, lead id
//   events/{vid}/{ts}-{rand}    one batch of events (append-only, so writes never collide)
//   days/{date}/{vid}           index of visitors seen on a UTC date (for the dashboard + cleanup)
//   leads/{ts}-{rand}           one audit request with its score, reply and timings
//   rl/{kind}/{date}/{hash}     rate-limit counters
import {getDeployStore, getStore} from '@netlify/blobs';
import type {Context} from '@netlify/functions';

type Store = ReturnType<typeof getStore>;
const NAME = 'fd-tracking';

export function db(context: Context, strong = false): Store {
  const options = {name: NAME, consistency: strong ? ('strong' as const) : ('eventual' as const)};
  return context.deploy?.context === 'production' ? getStore(options) : getDeployStore(options);
}

export const K = {
  visitor: (vid: string) => `visitors/${vid}`,
  events: (vid: string) => `events/${vid}/`,
  day: (date: string, vid: string) => `days/${date}/${vid}`,
  lead: (id: string) => `leads/${id}`,
  rl: (kind: string, date: string, hash: string) => `rl/${kind}/${date}/${hash}`,
};

/** The newest `limit` event batches for a visitor, flattened. */
export async function loadEvents(store: Store, vid: string, limit = 150): Promise<any[]> {
  const {blobs} = await store.list({prefix: K.events(vid)});
  const keys = blobs.map((b) => b.key).sort().slice(-limit);
  const batches = await Promise.all(keys.map((key) => store.get(key, {type: 'json'})));
  return batches.flat().filter(Boolean);
}

export async function count(store: Store, key: string): Promise<number> {
  return Number(await store.get(key)) || 0;
}

/** Best-effort counter: Blobs has no atomic increment, which is fine for abuse limits. */
export async function bump(store: Store, key: string, current: number) {
  await store.set(key, String(current + 1));
}

export async function removePrefix(store: Store, prefix: string) {
  const {blobs} = await store.list({prefix});
  await Promise.all(blobs.map((b) => store.delete(b.key)));
  return blobs.length;
}

/** Delete everything recorded about one browser (the visitor's "delete my data" button). */
export async function forgetVisitor(store: Store, vid: string) {
  const meta: any = await store.get(K.visitor(vid), {type: 'json'});
  await removePrefix(store, K.events(vid));
  await Promise.all([...(meta?.days ?? []).map((d: string) => store.delete(K.day(d, vid))), store.delete(K.visitor(vid))]);
}
