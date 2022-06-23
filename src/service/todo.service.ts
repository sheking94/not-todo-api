import ToDoModel from "../model/todo.model";

export function createToDo({
  userId,
  description,
}: {
  userId: string;
  description: string;
}) {
  return ToDoModel.create({ user: userId, description });
}

export function findToDosByUserId(userId: string) {
  return ToDoModel.find({ user: userId });
}
