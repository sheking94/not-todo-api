import chai from "chai";
import chaiHttp from "chai-http";
import config from "config";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import sinon from "sinon";

import app from "../src/app";
import SessionModel from "../src/model/session.model";
import UserModel from "../src/model/user.model";
import { signJwt } from "../src/utils/jwt";

const userData = {
  email: "test1@example.com",
  password: "Password123",
  passwordConfirmation: "Password123",
};

const userInput = {
  email: "test@example.com",
  password: "Password123",
};

let userId: mongoose.ObjectId;

const expect = chai.expect;

chai.use(chaiHttp);

let requester: ChaiHttp.Agent;

let timer: sinon.SinonFakeTimers;

describe("auth", () => {
  before(async () => {
    requester = chai.request.agent(app);
    await UserModel.deleteMany({});
    const user = await UserModel.create({
      ...userInput,
      passwordConfirmation: userInput.password,
    });
    userId = user?._id;
  });

  beforeEach(async () => {
    timer = sinon.useFakeTimers({
      now: Date.now(),
      // @ts-ignore
      shouldClearNativeTimers: true,
    });
    await SessionModel.deleteMany({});
  });

  afterEach(() => {
    timer.restore();
  });

  after(async () => {
    await UserModel.deleteMany({});
    await SessionModel.deleteMany({});
    requester.close();
  });

  describe("create session", () => {
    describe("given email and password are valid", () => {
      it("should return CREATED (201) status, access and refresh tokens in cookies and create session", async () => {
        const res = await requester.post("/api/sessions").send(userInput);

        const createdSessions = await SessionModel.find({
          user: userId,
        });

        expect(createdSessions).to.have.lengthOf(1);
        expect(createdSessions[0].valid).to.equal(true);
        expect(res).to.have.status(StatusCodes.CREATED);
        expect(res).to.have.cookie("accessToken");
        expect(res).to.have.cookie("refreshToken");
        expect(res.text).to.equal("Session created successfully.");
      });
    });

    describe("given email is invalid", () => {
      it("should return UNAUTHORIZED (401) status and not create session", async () => {
        const invalidEmail = "invalid@mail.com";

        const res = await requester
          .post("/api/sessions")
          .send({ ...userInput, email: invalidEmail });

        const createdSessions = await SessionModel.find({
          user: userId,
        });

        expect(createdSessions).to.have.lengthOf(0);
        expect(res).to.have.status(StatusCodes.UNAUTHORIZED);
        expect(res.text).to.equal("Invalid email or password.");
      });
    });

    describe("given password is invalid", () => {
      it("should return UNAUTHORIZED (401) status and not create session", async () => {
        const invalidPassword = "Pasdword123";

        const res = await requester
          .post("/api/sessions")
          .send({ ...userInput, password: invalidPassword });

        const createdSessions = await SessionModel.find({
          user: userId,
        });

        expect(createdSessions).to.have.lengthOf(0);
        expect(res).to.have.status(StatusCodes.UNAUTHORIZED);
        expect(res.text).to.equal("Invalid email or password.");
      });
    });

    describe("given email is empty", () => {
      it("should return BAD REQUEST (400) status and not create session", async () => {
        const res = await requester
          .post("/api/sessions")
          .send({ ...userInput, email: undefined });

        const createdSessions = await SessionModel.find({
          user: userId,
        });

        expect(createdSessions).to.have.lengthOf(0);
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal("Email is required.");
      });
    });

    describe("given password is empty", () => {
      it("should return BAD REQUEST (400) status and not create session", async () => {
        const res = await requester
          .post("/api/sessions")
          .send({ ...userInput, password: undefined });

        const createdSessions = await SessionModel.find({
          user: userId,
        });

        expect(createdSessions).to.have.lengthOf(0);
        expect(res).to.have.status(StatusCodes.BAD_REQUEST);
        expect(res.body[0].message).to.equal("Password is required.");
      });
    });
  });

  describe("refresh session", () => {
    describe("given refresh token is valid", () => {
      it("should return OK (200) status and access token in cookie", async () => {
        const session = await SessionModel.create({ user: userId });

        const refreshToken = signJwt(
          { session: session._id },
          "refreshTokenPrivateKey",
          { expiresIn: config.get<string>("refreshTokenTtl") }
        );

        const res = await requester
          .post("/api/sessions/refresh")
          .set("Cookie", `refreshToken=${refreshToken}`)
          .send();

        expect(res).to.have.status(StatusCodes.OK);
        expect(res).to.have.cookie("accessToken");
        expect(res.text).to.equal("Access token refreshed successfully.");
      });
    });

    describe("given refresh token expired", () => {
      it("should return UNAUTHORIZED (401) status", async () => {
        const session = await SessionModel.create({ user: userId });

        const refreshToken = signJwt(
          { session: session._id },
          "refreshTokenPrivateKey",
          { expiresIn: config.get<string>("refreshTokenTtl") }
        );

        timer.tick(config.get<string>("refreshTokenCookieTtl") + 100);

        const res = await requester
          .post("/api/sessions/refresh")
          .set("Cookie", `refreshToken=${refreshToken}`)
          .send();

        expect(res).to.have.status(StatusCodes.UNAUTHORIZED);
        expect(res).to.not.have.cookie("accessToken");
        expect(res.text).to.equal("Could not refresh access token.");
      });
    });

    describe("given refresh token is invalid", () => {
      it("should return UNAUTHORIZED (401) status", async () => {
        await SessionModel.create({ user: userId });

        const res = await requester
          .post("/api/sessions/refresh")
          .set("Cookie", "refreshToken=badrefreshtoken")
          .send();

        expect(res).to.have.status(StatusCodes.UNAUTHORIZED);
        expect(res).to.not.have.cookie("accessToken");
        expect(res.text).to.equal("Could not refresh access token.");
      });
    });

    describe("session is invalid", () => {
      it("should return UNAUTHORIZED (401) status", async () => {
        const session = await SessionModel.create({
          user: userId,
          valid: false,
        });

        const refreshToken = signJwt(
          { session: session._id },
          "refreshTokenPrivateKey",
          { expiresIn: config.get<string>("refreshTokenTtl") }
        );

        const res = await requester
          .post("/api/sessions/refresh")
          .set("Cookie", `refreshToken=${refreshToken}`)
          .send();

        expect(res).to.have.status(StatusCodes.UNAUTHORIZED);
        expect(res).to.not.have.cookie("accessToken");
        expect(res.text).to.equal("Could not refresh access token.");
      });
    });

    describe("session does not exist", () => {
      it("should return UNAUTHORIZED (401) status", async () => {
        const res = await requester
          .post("/api/sessions/refresh")
          .set("Cookie", "refreshToken=doesnotreallymatter")
          .send();

        expect(res).to.have.status(StatusCodes.UNAUTHORIZED);
        expect(res).to.not.have.cookie("accessToken");
        expect(res.text).to.equal("Could not refresh access token.");
      });
    });
  });

  describe("delete session", () => {
    describe("given refresh token is valid", () => {
      it("should return OK (200) status and delete accessToken and refreshToken cookies", async () => {
        const user = await requester.post("/api/users").send(userData);
        expect(user).to.have.status(StatusCodes.CREATED);

        const session = await requester
          .post("/api/sessions")
          .send({ email: userData.email, password: userData.password });

        expect(session).to.have.status(StatusCodes.CREATED);
        expect(session).to.have.cookie("accessToken");
        expect(session).to.have.cookie("refreshToken");

        const accessToken = session.header["set-cookie"][0]
          .split(";")[0]
          .split("=")[1];

        const refreshToken = session.header["set-cookie"][1]
          .split(";")[0]
          .split("=")[1];

        const res = await requester
          .delete("/api/sessions/logout")
          .set("Cookie", `accessToken=${accessToken}`)
          .set("Cookie", `refreshToken=${refreshToken}`)
          .send();

        expect(res).to.have.status(StatusCodes.OK);
        expect(res).to.not.have.cookie("accessToken");
        expect(res).to.not.have.cookie("refreshToken");
        expect(res).to.have.property("text");
        expect(res.text).to.be.string;
        expect(res.text).to.equal("Successfully logged out.");
      });
    });
  });
});
