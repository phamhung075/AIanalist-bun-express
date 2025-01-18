import { z } from "zod";
import { LoginSchema, RegisterSchema } from "./auth.validation";


export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;