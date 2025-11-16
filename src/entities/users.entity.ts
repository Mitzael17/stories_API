import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { maxNameLength, maxPasswordLength } from "../modules/auth/common/config/auth.config";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: maxNameLength, unique: true })
  name: string;

  @Column({ type: "varchar", length: maxPasswordLength })
  password: string;
}
