import { ArrayMaxSize, IsArray, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { TopicsEnum } from "../enums/topics.enum";
import { MAX_STORY_FILES } from "../../../../common/configs/static.config";

export class EditStoryDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(TopicsEnum)
  @IsOptional()
  topic: TopicsEnum;

  @IsString()
  @IsOptional()
  text: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_STORY_FILES)
  deleteFiles: string[] = [];
}
