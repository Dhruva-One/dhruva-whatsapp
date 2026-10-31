import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractMessages } from './parse';

test('extracts text messages with the receiving number', () => {
  const body = {
    entry: [{ changes: [{ value: { metadata: { phone_number_id: 'PN1' },
      messages: [{ from: '919800000001', id: 'wamid.1', type: 'text', text: { body: 'Leave tomorrow' } }] } }] }],
  };
  assert.deepEqual(extractMessages(body), [
    { from: '919800000001', id: 'wamid.1', type: 'text', text: 'Leave tomorrow', phoneNumberId: 'PN1' },
  ]);
});

test('ignores status-only webhooks', () => {
  assert.deepEqual(extractMessages({ entry: [{ changes: [{ value: { statuses: [] } }] }] }), []);
});
