import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import supertest from "supertest";

import * as UserService from "../service/user.service";
import createServer from "../utils/server";

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

export const userPayload = {
  _id: userId,
  email: "jane.doe@example.com",
  username: "Jane Doe",
};

const userInput = {
  email: "test@example.com",
  username: "Jane Doe",
  password: "Password123",
  passwordConfirmation: "Password123",
};

describe("user", () => {
  describe("user registration", () => {
    describe("given email, username and password are valid", () => {
      it("should return CREATED (201) status", async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, "createUser")
          // @ts-ignore
          .mockReturnValueOnce(userPayload);

        const { statusCode } = await supertest(app)
          .post("/api/users")
          .send(userInput);

        expect(statusCode).toBe(StatusCodes.CREATED);
        expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
      });
    });

    describe("given passwords do not match", () => {
      it("should return BAD REQUEST (400) status", async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, "createUser")
          // @ts-ignore
          .mockReturnValueOnce(userPayload);

        const { statusCode } = await supertest(app)
          .post("/api/users")
          .send({ ...userInput, passwordConfirmation: "qweqweqwe" });

        expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(createUserServiceMock).not.toHaveBeenCalledWith();
      });
    });
  });
});
