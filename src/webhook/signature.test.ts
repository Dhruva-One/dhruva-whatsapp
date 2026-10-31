import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sign, verifySignature } from './signature';

test('accepts a correctly signed body', () => {
  const body = '{"object":"whatsapp_business_account"}';
  assert.equal(verifySignature(body, sign(body, 's3cret'), 's3cret'), true);
});

test('rejects a tampered body, a wrong secret or a missing header', () => {
  const body = '{"a":1}';
  const sig = sign(body, 's3cret');
  assert.equal(verifySignature('{"a":2}', sig, 's3cret'), false);
  assert.equal(verifySignature(body, sig, 'other'), false);
  assert.equal(verifySignature(body, undefined, 's3cret'), false);
});
