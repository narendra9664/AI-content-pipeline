import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanup} from '../netlify/lib/cleanup.mts';

const DAY = 864e5;
const NOW = Date.UTC(2026, 8, 28, 12);
const date = (t: number) => new Date(t).toISOString().slice(0, 10);

// Just enough of a Blobs store: get/set/delete, and list with prefix and directories.
function memStore(initial: Record<string, unknown>) {
  const data = new Map(Object.entries(initial).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  return {
    data,
    async get(key: string, opts?: {type?: string}) {
      const v = data.get(key);
      return v === undefined ? null : opts?.type === 'json' ? JSON.parse(v) : v;
    },
    async set(key: string, v: string) {
      data.set(key, v);
    },
    async setJSON(key: string, v: unknown) {
      data.set(key, JSON.stringify(v));
    },
    async delete(key: string) {
      data.delete(key);
    },
    async list({prefix = '', directories = false}: {prefix?: string; directories?: boolean} = {}) {
      const keys = [...data.keys()].filter((k) => k.startsWith(prefix));
      if (!directories) return {blobs: keys.map((key) => ({key, etag: ''})), directories: []};
      const blobs: {key: string; etag: string}[] = [];
      const dirs = new Set<string>();
      for (const k of keys) {
        const rest = k.slice(prefix.length);
        const i = rest.indexOf('/');
        if (i === -1) blobs.push({key: k, etag: ''});
        else dirs.add(prefix + rest.slice(0, i));
      }
      return {blobs, directories: [...dirs]};
    },
  };
}

const visitor = (vid: string, lastDaysAgo: number, extra = {}) => {
  const last = NOW - lastDaysAgo * DAY;
  return {
    [`visitors/${vid}`]: {vid, last, days: [date(last)], ...extra},
    [`events/${vid}/${last}-a`]: [{type: 'visit'}],
    [`days/${date(last)}/${vid}`]: '',
  };
};

test('deletes anonymous visitors after 30 days and keeps everything else', async () => {
  const store = memStore({
    ...visitor('old-anon', 40),
    ...visitor('old-lead', 40, {lead: 'x'}),
    ...visitor('recent', 3),
  });
  const s = await cleanup(store, NOW);
  assert.equal(s.visitors, 1);
  assert.ok(s.finished);
  assert.ok(!store.data.has('visitors/old-anon'));
  assert.ok(![...store.data.keys()].some((k) => k.includes('old-anon')), 'events and index removed too');
  assert.ok(store.data.has('visitors/old-lead'), 'a visitor who became a lead is kept');
  assert.ok(store.data.has('visitors/recent'));
  assert.ok(store.data.has(`days/${date(NOW - 3 * DAY)}/recent`));
});

test('deletes leads after a year, with their browsing data', async () => {
  const oldT = NOW - 400 * DAY;
  const newT = NOW - 10 * DAY;
  const store = memStore({
    [`leads/${oldT}-aaa`]: {id: `${oldT}-aaa`, vid: 'v-old'},
    [`leads/${newT}-bbb`]: {id: `${newT}-bbb`, vid: 'v-new'},
    'visitors/v-old': {vid: 'v-old', last: oldT, days: []},
    [`events/v-old/${oldT}-z`]: [],
  });
  const s = await cleanup(store, NOW);
  assert.equal(s.leads, 1);
  assert.ok(!store.data.has(`leads/${oldT}-aaa`));
  assert.ok(!store.data.has('visitors/v-old'));
  assert.ok(!store.data.has(`events/v-old/${oldT}-z`));
  assert.ok(store.data.has(`leads/${newT}-bbb`));
});

test('deletes rate-limit counters older than 2 days', async () => {
  const store = memStore({
    [`rl/ip/${date(NOW - 5 * DAY)}/h1`]: '3',
    [`rl/email/${date(NOW - 5 * DAY)}/h2`]: '1',
    [`rl/ip/${date(NOW)}/h3`]: '2',
  });
  const s = await cleanup(store, NOW);
  assert.equal(s.counters, 2);
  assert.deepEqual([...store.data.keys()], [`rl/ip/${date(NOW)}/h3`]);
});

test('stops when time runs out, and finishes on the next run', async () => {
  const store = memStore({...visitor('a', 40), ...visitor('b', 41), ...visitor('c', 42)});
  const first = await cleanup(store, NOW, () => false);
  assert.equal(first.visitors, 1);
  assert.ok(!first.finished);
  const second = await cleanup(store, NOW);
  assert.equal(second.visitors, 2);
  assert.ok(second.finished);
});
