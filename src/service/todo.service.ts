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

export function updateToDo({
  toDoId,
  description,
  done,
}: {
  toDoId: string;
  description: string;
  done: boolean;
}) {
  return ToDoModel.findByIdAndUpdate(
    toDoId,
    { description, done },
    { new: true }
  );
}

export function findToDosByUserId(userId: string) {
  return ToDoModel.find({ user: userId });
}

export function findToDoById(toDoId: string) {
  return ToDoModel.findById(toDoId);
}

export function deleteToDo(toDoId: string) {
  return ToDoModel.findByIdAndDelete(toDoId);
}
