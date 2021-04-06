export interface QueueProvider {
  enqueueJob: <JobNameT extends JobName>(
    queueName: JobNameT,
    processor: (
      input: JobInput<JobMap[JobNameT]["args"]>
    ) => JobMap[JobNameT]["return"]
  ) => Promise<Job>;
  enqueueRepeatableJob: <JobNameT extends JobName>(
    queueName: JobNameT,
    jobId: string,
    processor: (
      input: JobInput<JobMap[JobNameT]["args"]>
    ) => JobMap[JobNameT]["return"],
    opts?: EnqueueRepeatableOpts
  ) => Promise<Job>;
}

export interface QueueConsumer {
  initializeWorker: <JobNameT extends JobName>(
    queueName: JobNameT,
    processor: (
      input: JobInput<JobMap[JobNameT]["args"]>
    ) => JobMap[JobNameT]["return"]
  ) => Promise<Worker>;
}
export interface Job {
  id: string;
}

export interface Worker {
  close: Promise<void>;
}

export interface JobInput<PayloadT> {
  id: string;
  payload: PayloadT;
}

export type RepeatOptions =
  | {
      type: "cron";
      value: string;
    }
  | {
      type: "repeat";
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
