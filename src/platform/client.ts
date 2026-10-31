import { config } from '../config';

/**
 * The gateway holds no business rules. Everything (who the sender is, which tenant, what they may do)
 * is decided by dhruva-platform. Replace with the client generated from the platform's OpenAPI contract.
 */
export async function forwardToPlatform(path: string, body: unknown): Promise<void> {
  const res = await fetch(config.platformApiUrl + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`platform ${path} -> ${res.status}`);
}
