import { User } from "../../../../entities/users.entity";

export interface ReqUserInterface {
  id: User["id"];
  name: User["name"];
}
