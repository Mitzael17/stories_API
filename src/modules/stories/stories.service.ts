import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Story } from "../../entities/stories.entity";
import { Equal, FindOptionsWhere, Repository } from "typeorm";
import { TopicsEnum } from "./common/enums/topics.enum";
import { StoriesErrorsEnum } from "./common/enums/stories.enum";
import { UsersService } from "../users/users.service";
import { CreateStoryDto } from "./common/dto/create-story.dto";
import { User } from "../../entities/users.entity";
import { EditStoryDto } from "./common/dto/edit-story.dto";
import { FilesService } from "../../packages/files/files.service";
import { MAX_FILES } from "../../common/configs/static.config";
import { FileErrorsEnum } from "../../packages/files/common/enum/file-errors.enum";

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story) private readonly storiesRepository: Repository<Story>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(FilesService) private readonly filesService: FilesService,
  ) {}

  async getStories(page = 1, to = 5, topic: TopicsEnum = undefined) {
    const from = (page - 1) * to;

    const where: FindOptionsWhere<Story> = {};

    if (topic) {
      where.topic = Equal(topic);
    }

    const stories = await this.storiesRepository.find({
      skip: from,
      take: to,
      relations: ["user"],
      select: { user: this.usersService.getSelectSafetyUserData() },
      where,
      order: { id: "DESC" },
    });

    return stories.map(story => {
      const files = story.files.split(", ");
      return { ...story, files: this.filesService.concatUrlWithFiles(files) };
    });
  }

  async getStoryById(id: number) {
    const story = await this.storiesRepository.findOne({ where: { id: Equal(id) }, relations: ["user"], select: { user: this.usersService.getSelectSafetyUserData() } });

    if (!story) throw new NotFoundException(StoriesErrorsEnum.NOT_FOUND_STORY);

    const fileNames = story.files.length > 0 ? story.files.split(", ") : [];

    return { ...story, files: this.filesService.concatUrlWithFiles(fileNames), fileNames };
  }

  async createStory(createStoryDto: CreateStoryDto, user: User, files: Express.Multer.File[] = []) {
    let filenames = "";

    if (files.length > 0) {
      filenames = this.filesService.getFilenamesString(this.filesService.saveFiles(files));
    }

    const story = await this.storiesRepository.create({ ...createStoryDto, date: new Date().toDateString(), files: filenames, user });

    return this.storiesRepository.save(story);
  }

  async editStory(editStoryDto: EditStoryDto, user: User, files: Express.Multer.File[] = []) {
    const story = await this.storiesRepository.findOne({ where: { id: Equal(editStoryDto.id) }, relations: ["user"] });

    if (!story) throw new NotFoundException(StoriesErrorsEnum.NOT_FOUND_STORY);
    if (story.user.id !== user.id) throw new ForbiddenException(StoriesErrorsEnum.DONT_HAVE_ACCESS);

    const { deleteFiles, ...editStoryData } = editStoryDto;
    const currentFiles = story.files.length ? story.files.split(", ") : [];

    const filteredDeleteFiles = deleteFiles.filter(file => currentFiles.includes(file));

    if (currentFiles.length + files.length - filteredDeleteFiles.length > MAX_FILES) throw new ForbiddenException(FileErrorsEnum.MAX_FILES);

    if (filteredDeleteFiles.length > 0) {
      this.filesService.deleteFiles(filteredDeleteFiles);
    }

    let newFilenames: string[] = [];

    if (files.length > 0) {
      newFilenames = this.filesService.saveFiles(files);
    }

    const filenamesForDb = this.filesService.getFilenamesString([...currentFiles.filter(file => !filteredDeleteFiles.includes(file)), ...newFilenames]);

    return this.storiesRepository.save({ ...story, ...editStoryData, files: filenamesForDb });
  }

  async deleteStory(id: number, user: User) {
    const story = await this.storiesRepository.findOne({ where: { id: Equal(id) }, relations: ["user"] });

    if (!story) throw new NotFoundException(StoriesErrorsEnum.NOT_FOUND_STORY);

    if (story.user.id !== user.id) throw new ForbiddenException(StoriesErrorsEnum.DONT_HAVE_ACCESS);

    if (story.files) {
      this.filesService.deleteFiles(story.files.split(", "));
    }

    this.storiesRepository.remove(story);

    return true;
  }

  createLoramStories() {
    const entities = [];

    for (let index = 0; index < 15; index++) {
      const story = {
        files: "",
        date: "2025-11-11",
        text: `Text ${index}`,
        title: `Title ${index}`,
        description: `Description ${index}`,
        user: { id: 1, name: "Test", password: "$2b$10$v0EedzzXdgvKu531pnL06e.EWD9yYDbehCMItaO9d9yPAM2Lwku9C" },
      };
      entities.push(this.storiesRepository.create(story));
    }

    this.storiesRepository.save(entities);
  }
}
