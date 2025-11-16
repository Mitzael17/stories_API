import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";

@Controller("users")
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get("")
  getUserData(@Request() req) {
    return req.user;
  }
}
