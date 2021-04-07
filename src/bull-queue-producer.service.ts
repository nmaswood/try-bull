import { Injectable } from "@nestjs/common";
import { BullQueueProducer } from "./bull-queue-producer";

import IORedis from "ioredis";

@Injectable()
export class BullQueueProducerService {
  #manager: BullQueueProducer;
  constructor() {
    this.#manager = new BullQueueProducer(new IORedis());
  }

  getProducer(): BullQueueProducer {
    return this.#manager;
  }
}
