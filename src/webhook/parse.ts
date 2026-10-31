/** Extracts inbound messages from a WhatsApp Business Platform webhook body. */
export interface InboundMessage {
  from: string;
  id: string;
  type: string; // text, image, audio, interactive, ...
  text?: string;
  phoneNumberId: string;
}

type Webhook = {
  entry?: { changes?: { value?: { metadata?: { phone_number_id?: string }; messages?: any[] } }[] }[];
};

export function extractMessages(body: unknown): InboundMessage[] {
  const out: InboundMessage[] = [];
  for (const entry of (body as Webhook)?.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id ?? '';
      for (const m of change.value?.messages ?? []) {
        out.push({ from: m.from, id: m.id, type: m.type, text: m.text?.body, phoneNumberId });
      }
    }
  }
  return out;
}
