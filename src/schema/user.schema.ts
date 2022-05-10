import { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  body: object({
    email: string({
      required_error: "Email is required.",
    }).email("Email is invalid."),
    username: string({
      required_error: "User name is required.",
    })
      .min(6, "User name must be at least 6 characters long.")
      .max(32, "User name cannot have more than 32 characters."),
    password: string({
      required_error: "Password is required.",
    })
      .min(6, "Password must be at least 6 characters long.")
      .max(32, "Password cannot have more than 32 characters."),
    passwordConfirmation: string({
      required_error: "Password confirmation is required.",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  }),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>["body"];
