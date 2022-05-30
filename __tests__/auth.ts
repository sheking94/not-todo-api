import mongoose from "mongoose";
import supertest from "supertest";
import { StatusCodes } from "http-status-codes";

import * as UserService from "../src/service/user.service";
import * as AuthService from "../src/service/auth.service";

import createServer from "../src/utils/server";

const userId = new mongoose.Types.ObjectId().toString();

const emailOk = "mail@mail.com";
const emailIncorrect = "incorrect-mail@mail.com";

const passwordOk = "passwd123";
const passwordIncorrect = "incorrect-passwd123";

const user = {
  _id: userId,
  email: emailOk,
  password: passwordOk,
  createdAt: new Date("2022-01-08T13:31:00.674Z"),
  updatedAt: new Date("2022-01-08T13:31:00.674Z"),
  __v: 0,
  validatePassword: () => true,
  toJSON: () => {
    return {
      _id: userId,
      email: emailOk,
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
    describe("given password is not correct", () => {
      it("should return UNAUTHORIZED (401) status", async () => {
        jest
          .spyOn(UserService, "findUserByEmail")
          // @ts-ignore
          .mockReturnValueOnce({ ...user, validatePassword: () => false });

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
          .send({ ...userInput, password: passwordIncorrect });

        expect(statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });
    describe("given email is not correct", () => {
      it("should return UNAUTHORIZED (401) status", async () => {
        jest
          .spyOn(UserService, "findUserByEmail")
          // @ts-ignore
          .mockReturnValueOnce(null);

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
          .send({ ...userInput, email: emailIncorrect });

        expect(statusCode).toBe(StatusCodes.UNAUTHORIZED);
      });
    });
  });
});
