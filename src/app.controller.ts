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

  @Get("queue/remove/:id")
  async remove(@Param("id") id: string): Promise<any> {
    const job = await this.queueProducer.removeRepeatableJobsWithId("echo", id);

    return { job, id };
  }

  @Get("queue/repeat/:message")
  async repeat(@Param("message") message: string): Promise<any> {
    const job = await this.queueProducer.upsertRepeatableJob(
      "echo",
      "nasr-repeat",

      {
        message: "hello world",
      },

      {
        repeat: {
          type: "every",
          value: 1000,
        },
      }
    );
    return {
      message,
      id: job.id,
    };
  }

  @Get("queue/once/:message")
  async once(@Param("message") message: string): Promise<any> {
    const job = await this.queueProducer.enqueueJob("echo", {
      message: "hello world",
    });
    return {
      message,
      id: job.id,
    };
  }
}
