import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Story } from "../../entities/stories.entity";
import { Equal, FindOptionsWhere, Repository } from "typeorm";
import { TopicsEnum } from "./common/enums/topics.enum";

@Injectable()
export class StoriesService {
  constructor(@InjectRepository(Story) private readonly storiesRepository: Repository<Story>) {}

  getStories(page = 2, to = 5, topic: TopicsEnum = undefined) {
    const from = (page - 1) * to;

    const where: FindOptionsWhere<Story> = {};

    if (topic) {
      where.topic = Equal(topic);
    }

    return this.storiesRepository.find({ skip: from, take: to, where });
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
