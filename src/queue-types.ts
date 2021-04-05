import { Queue, Processor } from "bullmq";

export interface JobMap {
  echo: {
    args: { message: string };
    return: undefined;
  };
}

export type JobName = keyof JobMap;

export type BullQueueForName<TName extends JobName> = Queue<
  JobMap[TName]["args"],
  JobMap[TName]["return"],
  TName
>;

export type BullProcessorForName<TName extends JobName> = Processor<
  JobMap[TName]["args"],
  JobMap[TName]["return"],
  TName
>;
