import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./users.entity";
import { TopicsEnum } from "../modules/stories/common/enums/topics.enum";

@Entity({ name: "stories" })
export class Story {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "date" })
  date: string;

  @Column({ type: "varchar", length: 50 })
  title: string;

  @Column({ type: "varchar", length: 256 })
  description: string;

  @Column()
  text: string;

  @Column({ type: "text" })
  files: string;

  @Column({ type: "enum", enum: TopicsEnum, default: TopicsEnum.NARRATIVE })
  topic: TopicsEnum;

  @ManyToOne(() => User, user => user.id, { nullable: false })
  user: User;
}
