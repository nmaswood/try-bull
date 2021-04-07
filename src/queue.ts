export interface QueueProducer {
  enqueueJob: <JobNameT extends JobName>(
    queueName: JobNameT,
    args: JobMap[JobNameT]["args"]
  ) => Promise<Job>;
  upsertRepeatableJob: <JobNameT extends JobName>(
    queueName: JobNameT,
    jobId: string,
    args: JobMap[JobNameT]["args"],
    opts: EnqueueRepeatableOpts
  ) => Promise<Job>;
  removeRepeatableJobsWithId: <JobNameT extends JobName>(
    queueName: JobNameT,
    jobId: string
  ) => Promise<RemoveJobs>;
}

export interface QueueConsumer {
  initializeWorker: <JobNameT extends JobName>(
    queueName: JobNameT,
    processor: Processor<JobNameT>
  ) => Worker;
}

export interface Job {
  id: string;
}

export interface Worker {
  close: () => Promise<void>;
}

export interface JobInput<PayloadT> {
  id: string;
  args: PayloadT;
}

export interface RemoveJobs {
  numberRemoved: number;
}

export type RepeatOptions =
  | {
      type: "cron";
      value: string;
    }
  | {
      type: "every";
      value: number;
    };

export interface EnqueueRepeatableOpts {
  repeat: RepeatOptions;
}

export interface JobMap {
  echo: {
    args: { message: string };
    return: undefined;
  };
}

export type JobName = keyof JobMap;
export type Processor<JobNameT extends JobName> = (
  input: JobInput<JobMap[JobNameT]["args"]>
) => JobMap[JobNameT]["return"];
