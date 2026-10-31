import '../src/load-env';
import { sign } from '../src/webhook/signature';

/** Sends a signed, Meta-shaped inbound text message to the local gateway. */
const body = JSON.stringify({
  object: 'whatsapp_business_account',
  entry: [{ changes: [{ field: 'messages', value: {
    metadata: { phone_number_id: 'LOCAL_PHONE_NUMBER_ID' },
    messages: [{ from: '919800000001', id: `wamid.local.${Date.now()}`, type: 'text', text: { body: 'Hi Dhruva' } }],
  } }] }],
});
const port = process.env.PORT ?? '3100';

fetch(`http://localhost:${port}/webhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-hub-signature-256': sign(body, process.env.WHATSAPP_APP_SECRET ?? '') },
  body,
}).then((r) => console.log(`gateway responded ${r.status}`));
