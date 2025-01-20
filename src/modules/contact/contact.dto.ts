import { z } from "zod";
import { CreateSchema, UpdateSchema, IdSchema } from "./contact.validation";
import { validateDTO } from "@/_core/helper/validateZodSchema";

export type CreateInput = z.infer<typeof CreateSchema>;
export type UpdateInput = z.infer<typeof UpdateSchema>;
export type IdInput = z.infer<typeof IdSchema>;

const validateCreateDTO = validateDTO(CreateSchema, 'body');
const validateIdDTO = validateDTO(IdSchema, 'params');
const validateUpdateDTO = validateDTO(UpdateSchema, 'body');

export { validateCreateDTO, validateIdDTO, validateUpdateDTO };