import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../../entities/users.entity";
import { Equal, Repository } from "typeorm";
import { BcryptService } from "../../packages/bcrypt/bcrypt.service";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, @Inject(BcryptService) private readonly bcryptService: BcryptService) {}

  async validateUser(name: string, password: string) {
    const user = await this.userRepository.findOne({ where: { name: Equal(name) } });

    if (user && (await this.bcryptService.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
