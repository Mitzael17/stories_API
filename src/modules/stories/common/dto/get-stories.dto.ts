import { TopicsEnum } from "../enums/topics.enum";
import { IsEnum, IsNumber, IsOptional } from "class-validator";

export class GetStoriesDto {
  @IsEnum(TopicsEnum)
  @IsOptional()
  topic?: TopicsEnum;

  @IsNumber()
  @IsOptional()
  to?: number;

  @IsNumber()
  @IsOptional()
  page?: number;
}
