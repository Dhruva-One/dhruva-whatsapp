import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildServer } from '../server';
import { loadCatalog } from './stubs';
import { inboundQueue } from '../queue/inbound';

// The queue holds a Redis connection open; close it so the test run can exit.
after(() => inboundQueue.close());

test('every gateway API in the spec answers (real route or 501 stub)', async () => {
  const app = buildServer();
  await app.ready();
  const missing: string[] = [];
  for (const e of loadCatalog()) {
    const res = await app.inject({ method: e.m as 'GET', url: e.p.replace(/\{\w+\}/g, 'x1') });
    if (res.statusCode === 404) missing.push(`${e.m} ${e.p}`);
  }
  await app.close();
  assert.deepEqual(missing, []);
});

test('a stub names the requirement modules it serves', async () => {
  const app = buildServer();
  const res = await app.inject({ method: 'GET', url: '/wa/templates' });
  await app.close();
  assert.equal(res.statusCode, 501);
  assert.ok(res.json().requirements.includes('WAB-ACC'));
});

test('a webhook POST without a body is rejected, not a server error', async () => {
  const app = buildServer();
  const res = await app.inject({ method: 'POST', url: '/wa/webhook/acct1' });
  await app.close();
  assert.equal(res.statusCode, 400);
});

test('the spec webhook path is implemented, not stubbed', async () => {
  const app = buildServer();
  const res = await app.inject({ method: 'POST', url: '/wa/webhook/acct1', payload: {}, headers: { 'x-hub-signature-256': 'sha256=00' } });
  await app.close();
  assert.equal(res.statusCode, 401); // real handler: bad signature
});
