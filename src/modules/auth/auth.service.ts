import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { signUpDto } from "./common/dto/sign-up.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entities/users.entity";
import { Equal, Repository } from "typeorm";
import { AuthErrorsEnum } from "./common/enums/auth.enum";
import { BcryptService } from "../../packages/bcrypt/bcrypt.service";
import { JwtService } from "@nestjs/jwt";
import { AuthResponse } from "./common/interfaces/auth-response.interface";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(BcryptService) private readonly bcryptService: BcryptService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async signUp(userData: signUpDto) {
    await this.checkIfUserExists(userData.name);

    const hashedPassword = await this.bcryptService.hash(userData.password);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    return this.generateAuthResponse(savedUser.id, savedUser.name);
  }

  private async checkIfUserExists(name: string): Promise<void> {
    const isNameBusy = await this.userRepository.exists({
      where: { name: Equal(name) },
    });

    if (isNameBusy) {
      throw new BadRequestException(AuthErrorsEnum.NAME_BUSY);
    }
  }

  generateAuthResponse(userId: number, userName: string): AuthResponse {
    const payload = {
      sub: userId,
      name: userName,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
