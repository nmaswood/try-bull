import * as BullMQ from "bullmq";
import * as LBQueue from "./i-queue";

import IORedis from "ioredis";

const DEFAULT_WORKER_ARGS = {
  concurrency: 1,
} as const;

export class BullQueueConsumer implements LBQueue.QueueConsumer {
  #queues: Record<
    LBQueue.JobName,
    {
      queue: BullQueueForName<LBQueue.JobName>;
      scheduler: BullMQ.QueueScheduler;
    }
  >;
  #connection: IORedis.Redis;

  constructor(connection: IORedis.Redis) {
    this.#connection = connection;
    this.#queues = {
      echo: {
        queue: new BullMQ.Queue("echo", { connection }),
        scheduler: new BullMQ.QueueScheduler("echo", { connection }),
      },
    };
  }

  initializeWorker = <NameT extends keyof LBQueue.JobMap>(
    name: NameT,
    processor: LBQueue.Processor<NameT>
  ): LBQueue.Worker => {
    const worker = new BullMQ.Worker(name, (job) => processor(job.data), {
      connection: this.#connection,
      ...DEFAULT_WORKER_ARGS,
    });

    return {
      close: async () => worker.close(),
    };
  };

  getQueues = () => this.#queues;
}

export type BullQueueForName<NameT extends LBQueue.JobName> = BullMQ.Queue<
  LBQueue.JobMap[NameT]["args"],
  LBQueue.JobMap[NameT]["return"],
  NameT
>;
