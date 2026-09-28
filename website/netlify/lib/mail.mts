// Email through the owner's Gmail (SMTP with an app password). MAIL_TRANSPORT=json swaps in
// nodemailer's JSON transport, which builds the message without sending it, for local tests.
import nodemailer from 'nodemailer';
import {esc} from './guard.mts';

let transport: ReturnType<typeof nodemailer.createTransport> | undefined;

const testMode = () => Netlify.env.get('MAIL_TRANSPORT') === 'json';

function getTransport() {
  transport ??= testMode()
    ? nodemailer.createTransport({jsonTransport: true})
    : nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {user: Netlify.env.get('GMAIL_USER'), pass: Netlify.env.get('GMAIL_APP_PASSWORD')},
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 6000,
      });
  return transport;
}

export const mailConfigured = () => testMode() || Boolean(Netlify.env.get('GMAIL_USER') && Netlify.env.get('GMAIL_APP_PASSWORD'));

export type Sent = {ok: boolean; ms: number; error?: string; raw?: string};

export async function sendMail(msg: {to: string; subject: string; text: string; replyTo?: string}): Promise<Sent> {
  const t0 = Date.now();
  try {
    const info: any = await getTransport().sendMail({
      from: {name: 'Narendra | frontdesk AI', address: Netlify.env.get('GMAIL_USER') || 'demo@example.com'},
      to: msg.to,
      replyTo: msg.replyTo,
      subject: msg.subject,
      text: msg.text,
      html: toHtml(msg.text),
    });
    return {ok: true, ms: Date.now() - t0, raw: testMode() ? String(info.message) : undefined};
  } catch (e: any) {
    return {ok: false, ms: Date.now() - t0, error: String(e?.message ?? e).slice(0, 200)};
  }
}

/** Plain paragraphs, like a person typed it. Bare URLs stay clickable in every mail client. */
export function toHtml(text: string) {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px">${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return `<div style="font-family:-apple-system,'Segoe UI',Arial,sans-serif;font-size:15px;line-height:1.55;color:#1d1d1f;max-width:560px">${paras}</div>`;
}
