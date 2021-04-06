import { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { QueueConsumer } from "./i-queue";

@Injectable()
export class QueueConsumerService implements OnModuleInit {
  constructor(private readonly queueConsumer: QueueConsumer) {}

  async onModuleInit() {
    console.log("Initializing consumer");
    this.queueConsumer.initializeWorker("echo" as const, (job) => {
      console.log(`Job Processed with ${job.args.message}, id: ${job.id}`);
      return undefined;
    });
    console.log("intialized worker");
  }
}
