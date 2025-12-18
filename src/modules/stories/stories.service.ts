import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Story } from "../../entities/stories.entity";
import { Equal, Repository } from "typeorm";
import { TopicsEnum } from "./common/enums/topics.enum";
import { StoriesErrorsEnum } from "./common/enums/stories.enum";
import { UsersService } from "../users/users.service";
import { CreateStoryDto } from "./common/dto/create-story.dto";
import { User } from "../../entities/users.entity";
import { EditStoryDto } from "./common/dto/edit-story.dto";
import { FilesService } from "../../packages/files/files.service";
import { MAX_STORY_FILES } from "../../common/configs/static.config";

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story) private readonly storiesRepository: Repository<Story>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(FilesService) private readonly filesService: FilesService,
  ) {}

  async getStories(page = 1, take = 5, topic: TopicsEnum = undefined, user: User = undefined) {
    const skip = (page - 1) * take;

    const [stories, total] = await this.storiesRepository.findAndCount({
      skip,
      take,
      relations: ["user"],
      select: { user: this.usersService.getSelectSafetyUserData() },
      where: { topic: topic ? Equal(topic) : undefined, user: user ? Equal(user?.id) : undefined },
      order: { id: "DESC" },
    });

    const storiesWithUrlFiles = stories.map(story => {
      const files = this.filesService.parseFilenamesFromString(story.files);

      return {
        ...story,
        files: this.filesService.concatUrlWithFiles(files),
      };
    });

    return { stories: storiesWithUrlFiles, total };
  }

  async getStoryById(id: number) {
    const story = await this.findStoryWithUserOrFail(id);
    const filenames = this.filesService.parseFilenamesFromString(story.files);

    return {
      ...story,
      files: this.filesService.concatUrlWithFiles(filenames),
      filenames,
    };
  }

  async createStory(createStoryDto: CreateStoryDto, user: User, files: Express.Multer.File[] = []) {
    const filenames = this.filesService.saveFilesAndGetString(files, MAX_STORY_FILES);

    const story = this.storiesRepository.create({
      ...createStoryDto,
      date: new Date().toDateString(),
      files: filenames,
      user,
    });

    return this.storiesRepository.save(story);
  }

  async editStory(editStoryDto: EditStoryDto, user: User, files: Express.Multer.File[] = []) {
    const story = await this.findStoryWithUserOrFail(editStoryDto.id);

    this.verifyStoryOwnership(story, user);

    const { deleteFiles, ...editStoryData } = editStoryDto;
    const updatedFiles = this.filesService.processFilesUpdate(story.files, deleteFiles, files, MAX_STORY_FILES);

    return this.storiesRepository.save({
      ...story,
      ...editStoryData,
      files: updatedFiles,
    });
  }

  async deleteStory(id: number, user: User) {
    const story = await this.findStoryWithUserOrFail(id);

    this.verifyStoryOwnership(story, user);

    if (story.files) {
      const filenames = this.filesService.parseFilenamesFromString(story.files);
      this.filesService.deleteFiles(filenames);
    }

    this.storiesRepository.remove(story);

    return true;
  }

  private async findStoryWithUserOrFail(id: number) {
    const story = await this.storiesRepository.findOne({
      where: { id: Equal(id) },
      relations: ["user"],
      select: { user: this.usersService.getSelectSafetyUserData() },
    });

    if (!story) {
      throw new NotFoundException(StoriesErrorsEnum.NOT_FOUND_STORY);
    }

    return story;
  }

  private verifyStoryOwnership(story: Story, user: User) {
    if (story.user.id !== user.id) {
      throw new ForbiddenException(StoriesErrorsEnum.DONT_HAVE_ACCESS);
    }
  }
}
