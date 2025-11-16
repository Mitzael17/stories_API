import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../entities/users.entity";
import { BcryptService } from "../../packages/bcrypt/bcrypt.service";
import { UsersController } from "./users.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, BcryptService],
  controllers: [UsersController],
})
export class UsersModule {}
