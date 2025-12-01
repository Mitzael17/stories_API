import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { maxNameLength, maxPasswordLength } from "../modules/auth/common/config/auth.config";
import { Story } from "./stories.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: maxNameLength, unique: true })
  name: string;

  @Column({ type: "varchar", length: maxPasswordLength })
  password: string;

  @OneToMany(() => Story, story => story.user)
  stories: Story[];
}
