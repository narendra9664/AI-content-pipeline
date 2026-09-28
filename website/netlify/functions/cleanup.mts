// Daily retention job. Scheduled functions get 30 s, so it stops at 25 s and carries on tomorrow.
import type {Config, Context} from '@netlify/functions';
import {db} from '../lib/store.mts';
import {cleanup} from '../lib/cleanup.mts';

export default async (_req: Request, context: Context) => {
  const start = Date.now();
  const s = await cleanup(db(context), Date.now(), () => Date.now() - start < 25_000);
  console.log(`cleanup: removed ${s.visitors} visitors, ${s.leads} leads, ${s.counters} counters${s.finished ? '' : ' (continues tomorrow)'}`);
};

export const config: Config = {schedule: '@daily'};
