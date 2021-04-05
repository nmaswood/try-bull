import { Queue, Worker, WorkerOptions } from "bullmq";
import {
  JobMap,
  JobName,
  BullQueueForName,
  BullProcessorForName,
} from "./queue-types";

import IORedis from "ioredis";

export class QueueManager {
  #queues: Record<JobName, BullQueueForName<JobName>>;
  #connection: IORedis.Redis;

  constructor(connection: IORedis.Redis) {
    this.#connection = connection;
    this.#queues = {
      echo: new Queue("echo", { connection }),
    };
  }

  getQueue = <TName extends JobName>(name: TName): BullQueueForName<TName> => {
    const queue = this.#queues[name];
    if (queue == undefined) {
      throw new Error(`Could not find queue corresponding to job name ${name}`);
    }

    return (queue as unknown) as BullQueueForName<TName>;
  };

  workerForQueue = <TName extends keyof JobMap>(
    name: TName,
    processor: BullProcessorForName<TName>,
    opts: WorkerOptions = {}
  ): Worker<JobMap[TName]["args"], JobMap[TName]["return"]> =>
    new Worker(name, processor, {
      ...opts,
      connection: this.#connection,
    });

  getQueues = (): Record<JobName, BullQueueForName<JobName>> => this.#queues;
}

export const QUEUE = new QueueManager(new IORedis());
