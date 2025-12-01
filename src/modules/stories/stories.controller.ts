import { Controller, Get, Inject, Param, ParseIntPipe, Query } from "@nestjs/common";
import { StoriesService } from "./stories.service";
import { GetStoriesDto } from "./common/dto/get-stories.dto";

@Controller("stories")
export class StoriesController {
  constructor(@Inject(StoriesService) private readonly storiesService: StoriesService) {}

  @Get()
  getStories(@Query() params: GetStoriesDto = {}) {
    return this.storiesService.getStories(params.page, params.to, params.topic);
  }

  @Get(":id")
  getStory(@Param("id", ParseIntPipe) id: number) {
    return this.storiesService.getStoryById(id);
  }
}
