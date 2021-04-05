import { Controller, Get, Request, Req, Param } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Get("upper/:id")
  upper(@Param("id") id: string): string {
    return this.appService.upper(id);
  }
}
