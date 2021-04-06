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

  @Get("/count")
  async count(): Promise<any> {
    const echoQueue = this.bullManagerService.getManager().getQueue("echo");
    const count = (
      await echoQueue.getJobs(["active", "waiting", "delayed", "completed"])
    ).length;
    console.log({
      count,
    });
    return count;
  }

  @Get("queue/delete")
  async priyanka(@Param("message") message: string): Promise<any> {
    const echoQueue = this.bullManagerService.getManager().getQueue("echo");
    await echoQueue.obliterate({ force: true });
    return "hello";
  }

  @Get("/list")
  async foo(@Param("message") message: string): Promise<any> {
    const echoQueue = this.bullManagerService.getManager().getQueue("echo");

    return {
      //baz: await echoQueue.removeRepeatableByKey("echo:hello-world-1234:::100"),
      //foo: await echoQueue.removeRepeatable(
      //"echo",
      //{
      //every: 5000,
      ////cron: "* * * * *",
      //},
      //"hello-world-1234"
      //),

      repeatable: await echoQueue.getRepeatableJobs(),
      jobs: await echoQueue.getJobs([
        "active",
        "waiting",
        "delayed",
        "completed",
      ]),
    };
  }

  @Get("queue/:message")
  async upper(@Param("message") message: string): Promise<any> {
    const echoQueue = this.bullManagerService.getManager().getQueue("echo");
    const foo = await echoQueue.getJob("hello-world-1234");
    console.log({ foo, baz: await echoQueue.getRepeatableJobs() });

    //const foo = echoQueue.getRepeatableJobs(

    let job;
    for (let i = 0; i < 10; i++) {
      job = await echoQueue.add(
        "echo",
        { message },
        {
          jobId: "hello-world-1234",
          removeOnComplete: true,
          removeOnFail: true,
          //repeat: {
          //every: 5000,
          ////cron: "* * * * *",
          //},
        }
      );
    }

    console.log({
      jobs: (
        await echoQueue.getJobs(["active", "waiting", "delayed", "completed"])
      ).length,
    });
    console.log(`Job Enqueued with ${job.data.message}, id: ${job.id}`);
    return {
      message,
      id: job.id ?? "No ID Supplied",
    };
  }
}
