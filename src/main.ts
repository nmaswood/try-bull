import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { router as bullBoardMiddleware } from "bull-board";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use("/jobs", bullBoardMiddleware);
  await app.listen(3123);
}
bootstrap();
