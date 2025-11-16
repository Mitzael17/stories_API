import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { signUpDto } from "./common/dto/sign-up.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entities/users.entity";
import { Equal, Repository } from "typeorm";
import { AuthErrorsEnum } from "./common/enums/auth.enum";
import { BcryptService } from "../../packages/bcrypt/bcrypt.service";
import { JwtService } from "@nestjs/jwt";
import { ReqUserInterface } from "./common/interfaces/req-user.interface";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(BcryptService) private readonly bcryptService: BcryptService,
    @Inject(JwtService) private readonly jwtService: JwtService,
  ) {}

  async signUp(userData: signUpDto) {
    const isNameBusy = await this.userRepository.exists({
      where: { name: Equal(userData.name) },
    });

    if (isNameBusy) throw new BadRequestException(AuthErrorsEnum.NAME_BUSY);

    const hashedPassword = this.bcryptService.hash(userData.password);

    const newUser = this.userRepository.create({
      ...userData,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);
    const payload = { sub: savedUser.id, name: savedUser.name };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async signIn(userData: ReqUserInterface) {
    // const userFromDb = await this.userRepository.findOne({
    //   where: { name: Equal(userData.name) },
    // });
    //
    // if (!userFromDb) throw new NotFoundException(AuthErrorsEnum.NOT_EXIST);

    // if (!(await this.bcryptService.compare(userData.password, userFromDb.password))) {
    //   throw new ForbiddenException(AuthErrorsEnum.WRONG_PASSWORD);
    // }

    const payload = { sub: userData.id, name: userData.name };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
