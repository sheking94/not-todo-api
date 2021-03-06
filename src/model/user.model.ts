import {
  DocumentType,
  getModelForClass,
  prop,
  pre,
  index,
  modelOptions,
  Severity,
} from "@typegoose/typegoose";
import argon2 from "argon2";

import logger from "../utils/logger";

export const privateFields = ["password", "__v"];

@pre<User>("save", async function () {
  if (!this.isModified(`password`)) return;

  const hash = await argon2.hash(this.password);
  this.password = hash;
  return;
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  // options: {
  //   allowMixed: Severity.ALLOW,
  // },
})
export class User {
  @prop({ lowercase: true, required: true, unique: true })
  email: string;

  @prop({ required: true })
  password: string;

  async validatePassword(this: DocumentType<User>, candidatePassword: string) {
    try {
      return await argon2.verify(this.password, candidatePassword);
    } catch (e: any) {
      logger.error(e, "Could not validate password.");
      return false;
    }
  }
}

const UserModel = getModelForClass(User);
export default UserModel;
