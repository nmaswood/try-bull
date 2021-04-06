import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { BullQueueManagerService } from "./bull-queue-manager.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly bullManagerService: BullQueueManagerService
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get("queue/:message")
  async upper(@Param("message") message: string): Promise<any> {
    const echoQueue = this.bullManagerService.getManager().getQueue("echo");
    const job = await echoQueue.add(
      "echo",
      { message },
      {
        jobId: "wtf-1",
        //removeOnComplete: true,
        //repeat: {
        //every: 1000,
        //limit: 1,
        //},
      }
    );
    const workers = await echoQueue.getWorkers();
    console.log({ workers });
    console.log(`Job Enqueued with ${job.data.message}, id: ${job.id}`);
    return {
      message,
      id: job.id ?? "No ID Supplied",
    };
  }
}
