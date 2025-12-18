import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { StoriesService } from "./stories.service";
import { GetStoriesDto } from "./common/dto/get-stories.dto";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import { CreateStoryDto } from "./common/dto/create-story.dto";
import { UserDecorator } from "../users/common/decorators/user.decorator";
import { User } from "../../entities/users.entity";
import { EditStoryDto } from "./common/dto/edit-story.dto";
import { DeleteStoryDto } from "./common/dto/delete-story.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { FilesService } from "../../packages/files/files.service";

@Controller("stories")
export class StoriesController {
  constructor(@Inject(StoriesService) private readonly storiesService: StoriesService, @Inject(FilesService) private readonly filesService: FilesService) {}

  @Get()
  getStories(@Query() params: GetStoriesDto = {}) {
    return this.storiesService.getStories(params.page, params.take, params.topic);
  }

  @Get("/my-stories")
  @UseGuards(JwtAuthGuard)
  getMyStories(@Query() params: GetStoriesDto = {}, @UserDecorator() user: User) {
    return this.storiesService.getStories(params.page, params.take, params.topic, user);
  }

  @Get(":id")
  getStory(@Param("id", ParseIntPipe) id: number) {
    return this.storiesService.getStoryById(id);
  }

  @Post("/create")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("files"))
  createStory(@UploadedFiles() files: Express.Multer.File[], @Body() createStoryDto: CreateStoryDto, @UserDecorator() user: User) {
    return this.storiesService.createStory(createStoryDto, user, files);
  }

  @Post("/edit")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor("files"))
  editStory(@UploadedFiles() files: Express.Multer.File[], @Body() editStoryDto: EditStoryDto, @UserDecorator() user: User) {
    return this.storiesService.editStory(editStoryDto, user, files);
  }

  @Delete("/delete")
  @UseGuards(JwtAuthGuard)
  deleteStory(@Body() deleteStoryDto: DeleteStoryDto, @UserDecorator() user: User) {
    return this.storiesService.deleteStory(deleteStoryDto.id, user);
  }
}
