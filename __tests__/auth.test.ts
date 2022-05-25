import mongoose from "mongoose";
import supertest from "supertest";
import { StatusCodes } from "http-status-codes";

import * as UserService from "../src/service/user.service";
import * as AuthService from "../src/service/auth.service";

import createServer from "../src/utils/server";
import argon2 from "argon2";

const userId = new mongoose.Types.ObjectId().toString();

const passwordOk = "passwd123";
const passwordBad = "passwd1234";

const user = {
  _id: userId,
  email: "mail@mail.com",
  password: argon2.hash(passwordOk),
  createdAt: new Date("2022-01-08T13:31:00.674Z"),
  updatedAt: new Date("2022-01-08T13:31:00.674Z"),
  __v: 0,
  validatePassword: () => true,
  toJSON: () => {
    return {
      _id: userId,
      email: "mail@mail.com",
    };
  },
};

const userInput = {
  email: "mail@mail.com",
  password: "passwd123",
};

const app = createServer();

describe("auth", () => {
  describe("create session", () => {
    describe("given username and password are correct", () => {
      it("should return CREATED (201) status", async () => {
        jest
          .spyOn(UserService, "findUserByEmail")
          // @ts-ignore
          .mockReturnValueOnce(user);

        // jest
        //   .spyOn(AuthService, "createSession")
        //   // @ts-ignore
        //   .mockReturnValueOnce(session);

        jest
          .spyOn(AuthService, "signAccessToken")
          // @ts-ignore
          .mockReturnValueOnce("--accessToken--");

        jest
          .spyOn(AuthService, "signRefreshToken")
          // @ts-ignore
          .mockReturnValueOnce("--refreshToken--");

        const { statusCode } = await supertest(app)
          .post("/api/sessions")
          .send(userInput);

        expect(statusCode).toBe(StatusCodes.CREATED);
      });
    });
  });
});
