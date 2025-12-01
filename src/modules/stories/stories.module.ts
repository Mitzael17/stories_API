import { Module } from "@nestjs/common";
import { StoriesController } from "./stories.controller";
import { StoriesService } from "./stories.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Story } from "../../entities/stories.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Story]), UsersModule],
  controllers: [StoriesController],
  providers: [StoriesService],
})
export class StoriesModule {}
