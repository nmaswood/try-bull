import * as BullMQ from "bullmq";
import * as LBQueue from "./queue";

import IORedis from "ioredis";

const DEFAULT_BULL_ARGS = {
  removeOnComplete: true,
  removeOnFail: true,
} as const;

const MAX_REPEATABLE_JOBS = 100;

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
  upsertRepeatableJob = async <JobNameT extends LBQueue.JobName>(
    queueName: JobNameT,
    jobId: string,
    args: LBQueue.JobMap[JobNameT]["args"],
    opts: LBQueue.EnqueueRepeatableOpts
  ): Promise<LBQueue.Job> => {
    const queue = this.getQueue(queueName);
    const jobs = await queue.getRepeatableJobs(0, MAX_REPEATABLE_JOBS);
    if (jobs.length === MAX_REPEATABLE_JOBS) {
      throw new Error("maximum number of repeatable jobs reached");
    }
    /*
     * jobID every 10 seconds print("hello")
     * jobID every 20 seconds print("hi")
     *
     * ---> 2 jobs
     */
    const jobsWithSameId = jobs.filter((job) => job.id === jobId);
    if (jobsWithSameId.length > 1) {
      throw Error(
        `Queue ${queueName} has ${jobsWithSameId.length} jobs with the same id ${jobId}`
      );
    }

    const job = await queue.add(queueName, args, {
      ...DEFAULT_BULL_ARGS,
      jobId,
      repeat: this.toBullRepeatOpts(opts.repeat),
    });
    return { id: job.id };
  };

  removeRepeatableJobsWithId = async <JobNameT extends LBQueue.JobName>(
    queueName: JobNameT,
    jobId: string
  ): Promise<LBQueue.RemoveJobs> => {
    const queue = this.getQueue(queueName);
    const jobs = await queue.getRepeatableJobs(0, MAX_REPEATABLE_JOBS);

    const jobKeys = jobs
      .filter((job) => job.id === jobId)
      .map((job) => job.key);

    for (const key of jobKeys) {
      await queue.removeRepeatableByKey(key);
    }

    return {
      numberRemoved: jobKeys.length,
    };
  };

  private toBullRepeatOpts = (
    opts: LBQueue.RepeatOptions
  ): BullMQ.RepeatOptions =>
    opts.type === "cron"
      ? {
          cron: opts.value,
        }
      : {
          every: opts.value,
        };

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
