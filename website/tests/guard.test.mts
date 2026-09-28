import test from 'node:test';
import assert from 'node:assert/strict';
import {cleanLead, clock, firstName, hasLinks, isVid, safeEqual, stripLinks, waLink} from '../netlify/lib/guard.mts';

const form = {name: 'Priya Shah', email: 'Priya@Example.com', company: 'Skyline Developers', website: 'skyline.in', volume: '50 to 200', phone: '+91 98200 12345'};

test('cleanLead accepts a normal request and normalises it', () => {
  const r = cleanLead(form);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.lead.email, 'priya@example.com');
    assert.equal(r.lead.phone, '+91 98200 12345');
  }
});

test('cleanLead rejects missing or bad required fields', () => {
  assert.deepEqual(cleanLead({...form, name: '  '}), {ok: false, error: 'name'});
  assert.deepEqual(cleanLead({...form, email: 'not-an-email'}), {ok: false, error: 'email'});
  assert.deepEqual(cleanLead({...form, company: ''}), {ok: false, error: 'company'});
  assert.deepEqual(cleanLead({...form, volume: '9000'}), {ok: false, error: 'volume'});
  assert.deepEqual(cleanLead(null), {ok: false, error: 'name'});
});

test('cleanLead drops junk phones and strips markup', () => {
  const r = cleanLead({...form, phone: 'call me maybe', name: '<script>x</script>Priya'});
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.lead.phone, '');
    assert.ok(!r.lead.name.includes('<'));
  }
});

test('hasLinks and stripLinks catch URLs, bare domains and emails', () => {
  for (const s of ['see https://x.io/a', 'www.spam.biz', 'visit cheap-pills.com today', 'mail me@evil.net', '<a href=x>hi</a>']) {
    assert.ok(hasLinks(s), s);
  }
  assert.ok(!hasLinks('Thanks for requesting the audit. Which two times suit you this week?'));
  assert.equal(stripLinks('Acme https://acme.com Homes'), 'Acme Homes');
  assert.equal(stripLinks('Buy now at cheap-pills.com!'), 'Buy now at !');
});

test('isVid accepts UUIDs only', () => {
  assert.ok(isVid('3b241101-e2bb-4255-8caf-4136c566a962'));
  assert.ok(!isVid('../../leads/x'));
  assert.ok(!isVid('3b241101e2bb42558caf4136c566a962'));
  assert.ok(!isVid(42));
});

test('safeEqual compares secrets of any length', () => {
  assert.ok(safeEqual('correct horse battery', 'correct horse battery'));
  assert.ok(!safeEqual('correct horse', 'correct horse battery'));
  assert.ok(!safeEqual('', 'x'));
});

test('waLink needs a country code', () => {
  assert.equal(waLink('+91 77330 72738'), 'https://wa.me/917733072738');
  assert.equal(waLink('0097150 123 4567'), 'https://wa.me/971501234567');
  assert.equal(waLink('98200 12345'), '');
  assert.equal(waLink('+12'), '');
});

test('firstName and clock', () => {
  assert.equal(firstName('  priya shah '), 'Priya');
  assert.equal(firstName('x'), '');
  const now = Date.UTC(2026, 8, 28, 10, 0);
  assert.equal(clock(Date.UTC(2026, 8, 28, 8, 32), 'Asia/Kolkata', now), '14:02');
  assert.equal(clock(Date.UTC(2026, 8, 26, 8, 32), 'Asia/Kolkata', now), '26 Sept, 14:02');
});
