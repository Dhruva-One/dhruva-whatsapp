import { createHmac, timingSafeEqual } from 'node:crypto';

/** Verifies Meta's X-Hub-Signature-256 header against the raw request body. */
export function verifySignature(rawBody: Buffer | string, header: string | undefined, appSecret: string): boolean {
  if (!header?.startsWith('sha256=') || !appSecret) return false;
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const given = header.slice('sha256='.length);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given, 'hex'), Buffer.from(expected, 'hex'));
}

export function sign(rawBody: Buffer | string, appSecret: string): string {
  return 'sha256=' + createHmac('sha256', appSecret).update(rawBody).digest('hex');
}
