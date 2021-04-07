import * as BullMQ from "bullmq";
import * as LBQueue from "./queue";

import IORedis from "ioredis";

const DEFAULT_WORKER_ARGS = {
  concurrency: 1,
} as const;

export class BullQueueConsumer implements LBQueue.QueueConsumer {
  #queues: Record<
    LBQueue.JobName,
    {
      queue: BullMQ.Queue<
        LBQueue.JobMap[LBQueue.JobName]["args"],
        LBQueue.JobMap[LBQueue.JobName]["return"],
        LBQueue.JobName
      >;

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
    const worker = new BullMQ.Worker<
      LBQueue.JobMap[NameT]["args"],
      LBQueue.JobMap[NameT]["return"],
      NameT
    >(name, (job) => processor({ id: job.id, args: job.data }), {
      connection: this.#connection,
      ...DEFAULT_WORKER_ARGS,
    });

    worker.on("failed", (job: BullMQ.Job, failedReason: string) => {
      console.log(
        `Worker failed processing ${job.id} due to ${JSON.stringify(
          failedReason
        )}`
      );
    });

    worker.on("completed", (job: BullMQ.Job, returnvalue: any) => {
      console.log(`Worker completed processing ${job.id}`);
    });

    return {
      close: async () => worker.close(),
    };
  };

  getQueues = () => this.#queues;
}
