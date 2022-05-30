import { StatusCodes } from "http-status-codes";
import supertest from "supertest";

import * as UserService from "../src/service/user.service";
import createServer from "../src/utils/server";

const app = createServer();

const userInput = {
  email: "test@example.com",
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
          .mockReturnValueOnce();

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
          .mockReturnValueOnce();

        const { statusCode } = await supertest(app)
          .post("/api/users")
          .send({ ...userInput, passwordConfirmation: "qweqweqwe" });

        expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
        expect(createUserServiceMock).not.toHaveBeenCalledWith();
      });
    });

    describe("given email or username already exist", () => {
      it("should return CONFLICT (409) status", async () => {
        const createUserServiceMock = jest
          .spyOn(UserService, "createUser")
          // @ts-ignore
          .mockRejectedValueOnce({ code: 11000 });

        const { statusCode } = await supertest(app)
          .post("/api/users")
          .send(userInput);

        expect(statusCode).toBe(StatusCodes.CONFLICT);
        expect(createUserServiceMock).not.toHaveBeenCalledWith();
      });
    });
  });
});
