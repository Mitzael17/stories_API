import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Story } from "../../entities/stories.entity";
import { Equal, FindOptionsWhere, Repository } from "typeorm";
import { TopicsEnum } from "./common/enums/topics.enum";
import { StoriesErrorsEnum } from "./common/enums/stories.enum";
import { UsersService } from "../users/users.service";

@Injectable()
export class StoriesService {
  constructor(@InjectRepository(Story) private readonly storiesRepository: Repository<Story>, @Inject(UsersService) private readonly usersService: UsersService) {}

  getStories(page = 2, to = 5, topic: TopicsEnum = undefined) {
    const from = (page - 1) * to;

    const where: FindOptionsWhere<Story> = {};

    if (topic) {
      where.topic = Equal(topic);
    }

    return this.storiesRepository.find({ skip: from, take: to, relations: ["user"], select: { user: this.usersService.getSelectSafetyUserData() }, where });
  }

  async getStoryById(id: number) {
    const story = await this.storiesRepository.findOne({ where: { id: Equal(id) }, relations: ["user"], select: { user: this.usersService.getSelectSafetyUserData() } });

    if (!story) throw new NotFoundException(StoriesErrorsEnum.NOT_FOUND_STORY);

    return story;
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
