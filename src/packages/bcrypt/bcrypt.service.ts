import { Injectable } from "@nestjs/common";
import { compare, hashSync } from "bcrypt";

@Injectable()
export class BcryptService {
  private readonly saltRounds = 10;
  private readonly secret = "dfjkhor";

  hash(data: string) {
    return hashSync(this.getSecretData(data), this.saltRounds);
  }

  compare(data: string, hashed: string) {
    return compare(this.getSecretData(data), hashed);
  }

  protected getSecretData(data: string) {
    return `${data}${this.secret}`;
  }
}
