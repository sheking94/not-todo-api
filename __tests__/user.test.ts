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

let requester: ChaiHttp.Agent;

describe("user", () => {
  before(() => {
    requester = chai.request.agent(app);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  after(async () => {
    await UserModel.deleteMany({});
    requester.close();
  });

  describe("registration", () => {
    describe("given email and password are valid", () => {
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

  describe("get current user", () => {
    describe("given access token is valid", () => {
      it("should return OK (200) status and user object", async () => {
        const user = await requester.post("/api/users").send(userInput);
        expect(user).to.have.status(StatusCodes.CREATED);

        const session = await requester
          .post("/api/sessions")
          .send({ email: userInput.email, password: userInput.password });

        expect(session).to.have.status(StatusCodes.CREATED);
        expect(session).to.have.cookie("accessToken");

        const accessToken = session.header["set-cookie"][0]
          .split(";")[0]
          .split("=")[1];

        const res = await requester
          .get("/api/users/me")
          .set("Cookie", `accessToken=${accessToken}`);

        expect(res).to.have.status(StatusCodes.OK);
        expect(res).to.have.property("text");
        expect(res.text).to.be.string;

        const userObject = JSON.parse(res.text);

        expect(userObject).to.have.keys(
          "_id",
          "email",
          "createdAt",
          "updatedAt",
          "iat",
          "exp"
        );
      });
    });

    // access token is expired
    // access token is invalid
  });
});
