import { Queue } from 'bullmq';
import { config } from '../config';

export const INBOUND_QUEUE = 'wa-inbound';

/** Inbound messages are persisted here before any processing, so a deploy or crash never loses one. */
export const inboundQueue = new Queue(INBOUND_QUEUE, { connection: { url: config.redisUrl } });

export interface InboundJob {
  receivedAt: string;
  payload: unknown; // raw webhook body from Meta
}
