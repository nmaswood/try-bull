import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BullConsumer } from "./bull-consumer";
import { BullQueueManagerService } from "./bull-queue-manager.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BullQueueManagerService, BullConsumer],
})
export class AppModule {}
