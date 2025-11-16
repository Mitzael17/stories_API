import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./users.entity";

@Entity({ name: "stories" })
export class story {
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

  @OneToMany(type => User, user => user.id)
  userId: User;
}
