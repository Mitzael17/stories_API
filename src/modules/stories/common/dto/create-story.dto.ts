import { IsEnum, IsString } from "class-validator";
import { TopicsEnum } from "../enums/topics.enum";

export class CreateStoryDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(TopicsEnum)
  topic: TopicsEnum;

  @IsString()
  text: string;
}
