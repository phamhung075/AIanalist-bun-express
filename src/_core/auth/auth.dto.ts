import { z } from "zod";
import { LoginSchema, RegisterSchema } from "./auth.validation";
import { validateDTO } from "../helper/validateZodSchema";


export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

const validateRegisterDTO = validateDTO(RegisterSchema, 'body');
const validateLoginDTO = validateDTO(LoginSchema, 'body');

export { validateRegisterDTO, validateLoginDTO };