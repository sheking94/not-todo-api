import chai from "chai";
import chaiHttp from "chai-http";
import { StatusCodes } from "http-status-codes";

import app from "../src/app";
import SessionModel from "../src/model/session.model";
import ToDoModel from "../src/model/todo.model";
import UserModel from "../src/model/user.model";

const userData = {
  email: "test1@example.com",
  password: "Password123",
  passwordConfirmation: "Password123",
};

const userInputCreateToDo = {
  description: "This is a ToDo.",
};

const userInputUpdateToDo = {
  description: "This is an updated ToDo.",
  done: true,
};

const expect = chai.expect;

chai.use(chaiHttp);

let requester: ChaiHttp.Agent;

describe("toDo", () => {
  before(() => {
    requester = chai.request.agent(app);
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
  });

  after(async () => {
    await UserModel.deleteMany({});
    await SessionModel.deleteMany({});
    await ToDoModel.deleteMany({});
    requester.close();
  });

  describe("create ToDo", () => {
    describe("given user input is valid", () => {
      it("should return CREATED (201) status and todo object", async () => {
        const user = await requester.post("/api/users").send(userData);
        expect(user).to.have.status(StatusCodes.CREATED);

        const session = await requester
          .post("/api/sessions")
          .send({ email: userData.email, password: userData.password });

        expect(session).to.have.status(StatusCodes.CREATED);
        expect(session).to.have.cookie("accessToken");

        const accessToken = session.header["set-cookie"][0]
          .split(";")[0]
          .split("=")[1];

        const res = await requester
          .post("/api/todos")
          .set("Cookie", `accessToken=${accessToken}`)
          .send(userInputCreateToDo);

        expect(res).to.have.status(StatusCodes.CREATED);
        expect(res).to.have.property("text");
        expect(res.text).to.be.string;

        const toDoObject = JSON.parse(res.text);

        expect(toDoObject).to.have.keys("message", "todo");
        expect(toDoObject.message).to.equal("ToDo created successfully.");
        expect(toDoObject.todo).to.have.keys(
          "user",
          "description",
          "done",
          "_id",
          "createdAt",
          "updatedAt"
        );
      });
    });
  });
  describe("update ToDo", () => {
    describe("given ToDo belongs to the current user", () => {
      it("should return OK (200) status and todo object", async () => {
        const user = await requester.post("/api/users").send(userData);
        expect(user).to.have.status(StatusCodes.CREATED);

        const session = await requester
          .post("/api/sessions")
          .send({ email: userData.email, password: userData.password });

        expect(session).to.have.status(StatusCodes.CREATED);
        expect(session).to.have.cookie("accessToken");

        const accessToken = session.header["set-cookie"][0]
          .split(";")[0]
          .split("=")[1];

        const toDo = await requester
          .post("/api/todos")
          .set("Cookie", `accessToken=${accessToken}`)
          .send(userInputCreateToDo);

        expect(toDo).to.have.status(StatusCodes.CREATED);
        expect(toDo).to.have.property("text");
        expect(toDo.text).to.be.string;

        const toDoObject = JSON.parse(toDo.text);

        expect(toDoObject).to.have.keys("message", "todo");
        expect(toDoObject.todo).to.have.keys(
          "user",
          "description",
          "done",
          "_id",
          "createdAt",
          "updatedAt"
        );

        const toDoId = toDoObject.todo._id;

        const res = await requester
          .put(`/api/todos/${toDoId}`)
          .set("Cookie", `accessToken=${accessToken}`)
          .send(userInputUpdateToDo);

        expect(res).to.have.status(StatusCodes.OK);
        expect(res).to.have.property("text");
        expect(res.text).to.be.string;

        const updatedToDoObject = JSON.parse(res.text);

        expect(updatedToDoObject).to.have.keys("message", "todo");
        expect(updatedToDoObject.message).to.equal(
          "ToDo updated successfully."
        );
        expect(updatedToDoObject.todo).to.have.keys(
          "user",
          "description",
          "done",
          "_id",
          "createdAt",
          "updatedAt"
        );
        expect(updatedToDoObject.todo.description).to.equal(
          "This is an updated ToDo."
        );
      });
    });
  });
});
