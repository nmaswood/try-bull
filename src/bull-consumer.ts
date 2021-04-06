import { OnModuleInit } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { BullQueueManagerService } from "./bull-queue-manager.service";
import { JobName, BullWorkerForName } from "./queue-types";

@Injectable()
export class BullConsumer implements OnModuleInit {
  constructor(private readonly bullManagerService: BullQueueManagerService) {}

  async onModuleInit() {
    console.log("wtf please work");
    const echo = this.bullManagerService.getManager();

    echo.workerForQueue("echo" as const, (job) => {
      console.log(`Job Processed with ${job.data.message}`);
      return undefined;
    });
  }
}
