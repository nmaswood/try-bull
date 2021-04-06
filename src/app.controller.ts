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
    const job = await echoQueue.add("echo", { message });
    console.log(`Job Enqueued with ${job.data.message}`);
    return {
      message,
      id: job.id ?? "No ID Supplied",
    };
  }
}
