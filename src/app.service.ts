import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }

  upper(word: string): string {
    return word.toUpperCase();
  }
}
