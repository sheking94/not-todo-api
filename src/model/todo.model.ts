import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from "@typegoose/typegoose";

import { User } from "./user.model";

@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
})
export class ToDo {
  @prop({ ref: () => User })
  user: Ref<User>;

  @prop({ required: true })
  description: string;

  @prop({ default: false })
  done: boolean;
}

const ToDoModel = getModelForClass(ToDo);
export default ToDoModel;
