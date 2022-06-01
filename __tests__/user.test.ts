import chai from "chai";
import chaiHttp from "chai-http";
import { StatusCodes } from "http-status-codes";

import app from "../src/app";
import UserModel from "../src/model/user.model";

const userInput = {
  email: "test@example.com",
  password: "Password123",
  passwordConfirmation: "Password123",
};

process.env.NODE_ENV = "test";

const expect = chai.expect;

chai.use(chaiHttp);

const requester = chai.request(app).keepOpen();

describe("user", () => {
  beforeEach((done) => {
    UserModel.remove({}, (err) => {
      done();
    });
  });

  after((done) => {
    UserModel.remove({}, (err) => {
      done();
    });
  });

  describe("registration", () => {
    describe("given email, username and password are valid", () => {
      it("should return CREATED (201) status and create user", async () => {
        const res = await requester.post("/api/users").send(userInput);

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.have.lengthOf(1);
        expect(res).to.have.status(StatusCodes.CREATED);
        expect(res.text).to.equal("User created successfully.");
      });
    });

    describe("given email already exists", () => {
      it("should return CONFLICT (409) status and not create user", async () => {
        await UserModel.create(userInput);

        const res = await requester.post("/api/users").send(userInput);

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.have.lengthOf(1);
        expect(res).to.have.status(StatusCodes.CONFLICT);
        expect(res.text).to.equal("Account with this email already exists.");
      });
    });

    describe("given passwords do not match", () => {
      it("should return BAD REQUEST (400) status and not create user", async () => {
        const invalidPassword = "Pasdword123";

        const res = await requester
          .post("/api/users")
          .send({ ...userInput, passwordConfirmation: invalidPassword });

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.be.empty;
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal("Passwords do not match.");
      });
    });

    describe("given email is invalid", () => {
      it("should return BAD REQUEST (400) status and not create user", async () => {
        const invalidEmail = "invalidEmail";

        const res = await requester
          .post("/api/users")
          .send({ ...userInput, email: invalidEmail });

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.be.empty;
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal("Email is invalid.");
      });
    });

    describe("given email is empty", () => {
      it("should return BAD REQUEST (400) status and not create user", async () => {
        const res = await requester
          .post("/api/users")
          .send({ ...userInput, email: undefined });

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.be.empty;
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal("Email is required.");
      });
    });

    describe("given password is empty", () => {
      it("should return BAD REQUEST (400) status and not create user", async () => {
        const res = await requester
          .post("/api/users")
          .send({ ...userInput, password: undefined });

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.be.empty;
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal("Password is required.");
      });
    });

    describe("given password confirmation is empty", () => {
      it("should return BAD REQUEST (400) status and not create user", async () => {
        const res = await requester
          .post("/api/users")
          .send({ ...userInput, passwordConfirmation: undefined });

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.be.empty;
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal(
          "Password confirmation is required."
        );
      });
    });

    describe("given password is too short", () => {
      it("should return BAD REQUEST (400) status and not create user", async () => {
        const invalidPassword = "qaz";

        const res = await requester
          .post("/api/users")
          .send({ ...userInput, password: invalidPassword });

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.be.empty;
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal(
          "Password must be at least 6 characters long."
        );
      });
    });

    describe("given password is too long", () => {
      it("should return BAD REQUEST (400) status and not create user", async () => {
        const invalidPassword = "qwertyuiopasdfghkjlzxcvbnmqwertyuiopaddf";

        const res = await requester
          .post("/api/users")
          .send({ ...userInput, password: invalidPassword });

        const createdUsers = await UserModel.find({ email: userInput.email });

        expect(createdUsers).to.be.empty;
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal(
          "Password cannot have more than 32 characters."
        );
      });
    });
  });
});
