import { OnModuleInit, Inject } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { QueueConsumer } from "./queue";

@Injectable()
export class QueueConsumerService implements OnModuleInit {
  constructor(
    @Inject("QueueConsumer") private readonly queueConsumer: QueueConsumer
  ) {}

  async onModuleInit() {
    console.log("Initializing consumer");

    this.queueConsumer.initializeWorker("echo" as const, (job) => {
      console.log(`Echo:  ${job.args.message}, id: ${job.id}`);
      return undefined;
    });
    console.log("intialized worker");
  }
}
