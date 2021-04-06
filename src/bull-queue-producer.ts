import * as BullMQ from "bullmq";
import * as LBQueue from "./i-queue";

import IORedis from "ioredis";

const DEFAULT_BULL_ARGS = {
  removeOnComplete: true,
  removeOnFail: true,
} as const;

export class BullQueueProducer implements LBQueue.QueueProducer {
  #queues: Record<LBQueue.JobName, BullQueueForName<LBQueue.JobName>>;

  constructor(connection: IORedis.Redis) {
    this.#queues = {
      echo: new BullMQ.Queue("echo", { connection }),
    };
  }

  enqueueJob = async <JobNameT extends LBQueue.JobName>(
    queueName: JobNameT,
    args: LBQueue.JobMap[JobNameT]["args"]
  ): Promise<LBQueue.Job> => {
    const queue = this.getQueue(queueName);
    const job = await queue.add(queueName, args, DEFAULT_BULL_ARGS);
    return { id: job.id };
  };

  /*
   * If one enqueues the two jobs with the same id
   * if they both have the same cron settings one will be ignored.
   *
   * if they have different cron settings they will both be added
   *
   * # TODO add logic that does a non-atomic update a job if you change the cron settings
   *
   */
  enqueueRepeatableJob = async <JobNameT extends LBQueue.JobName>(
    queueName: JobNameT,
    jobId: string,
    args: LBQueue.JobMap[JobNameT]["args"],
    opts: LBQueue.EnqueueRepeatableOpts
  ): Promise<LBQueue.Job> => {
    const queue = this.getQueue(queueName);
    const job = await queue.add(queueName, args, {
      ...DEFAULT_BULL_ARGS,
      jobId,
      repeat: this.bullRepeatOpts(opts.repeat),
    });
    return { id: job.id };
  };

  private bullRepeatOpts = (
    opts: LBQueue.RepeatOptions
  ): BullMQ.RepeatOptions =>
    opts.type === "cron" ? { cron: opts.value } : { every: opts.value };

  private getQueue = <TName extends LBQueue.JobName>(
    name: TName
  ): BullQueueForName<TName> => {
    const queue = this.#queues[name];
    if (queue == undefined) {
      throw new Error(`Could not find queue corresponding to job name ${name}`);
    }

    return (queue as unknown) as BullQueueForName<TName>;
  };
}

export type BullQueueForName<TName extends LBQueue.JobName> = BullMQ.Queue<
  LBQueue.JobMap[TName]["args"],
  LBQueue.JobMap[TName]["return"],
  TName
>;
