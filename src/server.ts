import './load-env';
import Fastify from 'fastify';
import { config } from './config';
import { inboundQueue, InboundJob } from './queue/inbound';
import { verifySignature } from './webhook/signature';

export function buildServer() {
  const app = Fastify({ logger: true });

  // Keep the raw body so the Meta signature can be checked byte for byte.
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, (_req, body, done) => {
    try {
      done(null, { raw: body, json: JSON.parse(body.toString('utf8')) });
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  app.get('/health', async () => ({ status: 'ok', service: 'dhruva-whatsapp' }));

  // Meta webhook verification handshake.
  app.get('/webhook', async (req, reply) => {
    const q = req.query as Record<string, string>;
    if (q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === config.verifyToken) {
      return reply.type('text/plain').send(q['hub.challenge']);
    }
    return reply.code(403).send();
  });

  // Queue first: verify, persist to the queue, acknowledge. Processing happens in the worker.
  app.post('/webhook', async (req, reply) => {
    const { raw, json } = req.body as { raw: Buffer; json: unknown };
    if (!verifySignature(raw, req.headers['x-hub-signature-256'] as string | undefined, config.appSecret)) {
      return reply.code(401).send();
    }
    const job: InboundJob = { receivedAt: new Date().toISOString(), payload: json };
    await inboundQueue.add('inbound', job, { attempts: 10, backoff: { type: 'exponential', delay: 1000 } });
    return reply.code(200).send();
  });

  return app;
}

if (require.main === module) {
  const app = buildServer();
  app.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
}
