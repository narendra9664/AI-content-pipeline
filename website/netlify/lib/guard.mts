// Input validation and small helpers shared by the functions. Everything here is pure, so the
// unit tests can run it without Netlify.
import {createHash, timingSafeEqual} from 'node:crypto';

export const VOLUMES = ['Under 50', '50 to 200', '200 to 500', '500+'];

export type Lead = {name: string; email: string; company: string; website: string; volume: string; phone: string};

const clip = (v: unknown, n: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '';

export const isVid = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** Validate the audit form. Junk in the optional phone field is dropped rather than rejected. */
export function cleanLead(body: any): {ok: true; lead: Lead} | {ok: false; error: string} {
  const lead: Lead = {
    name: clip(body?.name, 80),
    email: clip(body?.email, 120).toLowerCase(),
    company: clip(body?.company, 100),
    website: clip(body?.website, 100),
    volume: clip(body?.volume, 20),
    phone: clip(body?.phone, 30),
  };
  if (!lead.name) return {ok: false, error: 'name'};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) return {ok: false, error: 'email'};
  if (!lead.company) return {ok: false, error: 'company'};
  if (!VOLUMES.includes(lead.volume)) return {ok: false, error: 'volume'};
  if (lead.phone && !/^[+()\d\s.-]{6,30}$/.test(lead.phone)) lead.phone = '';
  return {ok: true, lead};
}

const LINK = /\b(?:https?:\/\/|www\.)\S+|\S+@\S+\.\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|ai|co|in|ae|uk|us|app|dev|me|info|biz|xyz|site|online|link|ly)\b/i;

/** True if the text contains anything a mail client would turn into a link. */
export const hasLinks = (text: string) => LINK.test(text) || /<[a-z!/]/i.test(text);

/** Remove links, addresses and markup from user input before it goes into an outgoing email. */
export const stripLinks = (text: string) =>
  text
    .replace(new RegExp(LINK.source, 'gi'), '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

export const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Constant-time comparison that also hides the length of the secret. */
export function safeEqual(given: string, secret: string) {
  return timingSafeEqual(createHash('sha256').update(given).digest(), createHash('sha256').update(secret).digest());
}

export const today = (d = new Date()) => d.toISOString().slice(0, 10);

export const firstName = (name: string) => {
  const first = name.trim().split(/\s+/)[0] || '';
  return first.length > 1 ? first[0].toUpperCase() + first.slice(1) : '';
};

/** A wa.me link, only when the number has a country code (so we never guess the country). */
export function waLink(phone: string) {
  const p = phone.trim();
  if (!p.startsWith('+') && !p.startsWith('00')) return '';
  const digits = p.replace(/\D/g, '').replace(/^00/, '');
  return digits.length >= 8 && digits.length <= 15 ? `https://wa.me/${digits}` : '';
}

export const isBot = (ua: string) => !ua || /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse/i.test(ua);

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** "14:02" in the owner's time zone, with the date when it isn't today. */
export function clock(t: number, tz: string, now = Date.now()) {
  const day = (x: number) => new Intl.DateTimeFormat('en-GB', {timeZone: tz, day: 'numeric', month: 'short'}).format(x);
  const time = new Intl.DateTimeFormat('en-GB', {timeZone: tz, hour: '2-digit', minute: '2-digit'}).format(t);
  return day(t) === day(now) ? time : `${day(t)}, ${time}`;
}

export const rid = () => Math.random().toString(36).slice(2, 10);
