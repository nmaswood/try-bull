import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { RedisModule } from "@nestjs-modules/ioredis";
import { QueueConsumerService } from "./queue-consumer";

import { BullQueueConsumer } from "./bull-queue-consumer";
import { BullQueueProducer } from "./bull-queue-producer";
import { BullBoardModule } from "./bull-board-module";

import IORedis from "ioredis";

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        url: "redis://localhost:6379",
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: "QueueConsumer",
      useClass: BullQueueConsumer,
    },
    {
      provide: "QueueProducer",
      useClass: BullQueueProducer,
    },

    {
      useFactory: (optProvider) => {
        return new IORedis();
      },
      provide: "IORedis.Redis",
    },

    AppService,
    QueueConsumerService,
    BullBoardModule,
  ],
})
export class AppModule {}
