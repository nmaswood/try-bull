import { Controller, Get, Inject, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { QueueProducer } from "./queue";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject("QueueProducer")
    private readonly queueProducer: QueueProducer
  ) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get("queue/:message")
  async enqueue(@Param("message") message: string): Promise<any> {
    const job = await this.queueProducer.enqueueJob("echo", {
      message: "hello world",
    });
    console.log(`Enqueue job with id: ${job.id}`);

    return {
      message,
      id: job.id,
    };
  }
}
