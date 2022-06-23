import { object, string, TypeOf } from "zod";

export const createToDoSchema = object({
  body: object({
    description: string({
      required_error: "ToDo description is required.",
    }),
  }),
});

export type CreateSessionInput = TypeOf<typeof createToDoSchema>["body"];
