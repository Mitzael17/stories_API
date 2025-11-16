import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../entities/users.entity";
import { BcryptService } from "../../packages/bcrypt/bcrypt.service";
import { JwtModule } from "@nestjs/jwt";
import { ACCESS_TOKEN_LIFE, ACCESS_TOKEN_SECRET } from "../../common/configs/securite.config";
import { UsersService } from "../users/users.service";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./strategies/local.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({}),
    JwtModule.register({
      global: true,
      secret: ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_LIFE },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, BcryptService, UsersService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
