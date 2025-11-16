import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { maxNameLength, maxPasswordLength, minNameLength } from "../config/auth.config";

export class signUpDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(minNameLength)
  @MaxLength(maxNameLength)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(maxPasswordLength)
  password: string;
}
