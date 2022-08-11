import { boolean, object, string, TypeOf } from "zod";

export const createToDoSchema = object({
  body: object({
    description: string({
      required_error: "ToDo description is required.",
    }),
  }),
});

export const updateToDoSchema = object({
  body: object({
    description: string({
      required_error: "ToDo description is required.",
    }),
    done: boolean({
      required_error: "ToDo done property is required.",
    }),
  }),
});

export type CreateToDoInput = TypeOf<typeof createToDoSchema>["body"];
export type UpdateToDoInput = TypeOf<typeof updateToDoSchema>["body"];
