import { IsNumber } from "class-validator";

export class DeleteStoryDto {
  @IsNumber()
  id: number;
}
