import { Injectable } from "@nestjs/common";
import { Queue } from "bull";

@Injectable()
export class AppService {
  //constructor() {}

  async getHello(): Promise<string> {
    return "Hello World!";
  }

  upper(word: string): string {
    return word.toUpperCase();
  }
}
