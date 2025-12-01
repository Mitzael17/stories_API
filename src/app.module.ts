import { Module, ValidationPipe } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { BcryptModule } from "./packages/bcrypt/bcrypt.module";
import { UsersModule } from "./modules/users/users.module";
import { StoriesModule } from "./modules/stories/stories.module";
import * as process from "process";
import { APP_PIPE } from "@nestjs/core";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.APP_DATABASE_HOST || "localhost",
      port: parseInt(process.env.APP_DATABASE_PORT, 10) || 5432,
      username: process.env.APP_DATABASE_USER || "postgres",
      password: process.env.APP_DATABASE_PASSWORD || "123",
      database: process.env.APP_DATABASE_NAME || "Stories_API",
      entities: ["dist/**/*.entity{.ts,.js}"],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    BcryptModule,
    UsersModule,
    StoriesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    },
  ],
})
export class AppModule {}
