import { Body, Controller, Inject, Post, UseGuards, Request } from "@nestjs/common";
import { signUpDto } from "./common/dto/sign-up.dto";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./guards/local.guard";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("sign-up")
  signUp(@Body() signUpDto: signUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(LocalGuard)
  @Post("sign-in")
  signIn(@Request() req) {
    return this.authService.signIn(req.user);
  }
}
