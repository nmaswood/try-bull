import { Injectable } from "@nestjs/common";
import { BullQueueManager } from "./queue";

import IORedis from "ioredis";

@Injectable()
export class BullQueueManagerService {
  #manager: BullQueueManager;
  constructor() {
    this.#manager = new BullQueueManager(new IORedis());
  }

  getManager(): BullQueueManager {
    return this.#manager;
  }
}
