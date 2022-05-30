import chai from "chai";
import chaiHttp from "chai-http";
import { StatusCodes } from "http-status-codes";
import app from "../src/app";

import connectToDb from "../src/utils/connectToDb";
import createServer from "../src/utils/server";

const userInput = {
  email: "test@example.com",
  password: "Password123",
  passwordConfirmation: "Password123",
};

const should = chai.should();

chai.use(chaiHttp);

const requester = chai.request(app).keepOpen();

describe("user", () => {
  describe("user registration", () => {
    describe("given email, username and password are valid", () => {
      it("should return CREATED (201) status", (done) => {
        const uniqueEmail = `test${Math.floor(
          Math.random() * 1000
        )}@example.com`;
        requester
          .post("/api/users")
          .send({ ...userInput, email: uniqueEmail })
          .end((err, res) => {
            res.should.have.status(StatusCodes.CREATED);
            done();
          });
      });
    });

    describe("given email already exists", () => {
      it("should return CONFLICT (409) status", (done) => {
        requester.post("/api/users").send(userInput).end();
        requester
          .post("/api/users")
          .send(userInput)
          .end((err, res) => {
            res.should.have.status(StatusCodes.CONFLICT);
            done();
          });
      });
    });

    describe("given passwords do not match", () => {
      it("should return BAD REQUEST (400) status", (done) => {
        const badPassword = "Pasdword123";
        requester
          .post("/api/users")
          .send({ ...userInput, passwordConfirmation: badPassword })
          .end((err, res) => {
            res.should.have.status(StatusCodes.BAD_REQUEST);
            done();
          });
      });
    });

    // describe("given passwords do not match", () => {
    //   it("should return BAD REQUEST (400) status", async () => {
    //     const createUserServiceMock = jest
    //       .spyOn(UserService, "createUser")
    //       // @ts-ignore
    //       .mockReturnValueOnce();

    //     const { statusCode } = await supertest(app)
    //       .post("/api/users")
    //       .send({ ...userInput, passwordConfirmation: "qweqweqwe" });

    //     expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
    //     expect(createUserServiceMock).not.toHaveBeenCalledWith();
    //   });
    // });

    // describe("given email or username already exist", () => {
    //   it("should return CONFLICT (409) status", async () => {
    //     const createUserServiceMock = jest
    //       .spyOn(UserService, "createUser")
    //       // @ts-ignore
    //       .mockRejectedValueOnce({ code: 11000 });

    //     const { statusCode } = await supertest(app)
    //       .post("/api/users")
    //       .send(userInput);

    //     expect(statusCode).toBe(StatusCodes.CONFLICT);
    //     expect(createUserServiceMock).not.toHaveBeenCalledWith();
    //   });
    // });
  });
});
