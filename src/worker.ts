import './load-env';
import { Worker } from 'bullmq';
import { config } from './config';
import { getConversation, updateConversation } from './conversations/state';
import { INBOUND_QUEUE, InboundJob } from './queue/inbound';
import { extractMessages } from './webhook/parse';

/**
 * Processes queued inbound messages: updates conversation state and hands the message to the
 * platform (which decides who the sender is and what happens). Photos and voice notes go through
 * intake/ to the platform and Dhruva; anything Dhruva cannot handle goes to handover/ for a person.
 */
const worker = new Worker<InboundJob>(
  INBOUND_QUEUE,
  async (job) => {
    for (const msg of extractMessages(job.data.payload)) {
      const convo = getConversation(msg.from);
      updateConversation(msg.from, { step: convo.step === 'start' ? 'menu' : convo.step });
      console.log(`[inbound] ${msg.type} from ${msg.from.slice(0, 4)}****** id=${msg.id} step=${convo.step}`);
      // TODO: forwardToPlatform('/v1/whatsapp/inbound', msg) once the platform endpoint exists.
    }
  },
  { connection: { url: config.redisUrl }, concurrency: 20 },
);

worker.on('failed', (job, err) => console.error(`job ${job?.id} failed: ${err.message}`));
console.log(`whatsapp worker listening on queue ${INBOUND_QUEUE}`);
