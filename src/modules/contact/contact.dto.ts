import { z } from "zod";
import { CreateSchema, UpdateSchema, IdSchema, PaginationSchema } from "./contact.validation";
import { validateDTO } from "@/_core/helper/validateZodSchema";

export type CreateInput = z.infer<typeof CreateSchema>;
export type UpdateInput = z.infer<typeof UpdateSchema>;
export type IdInput = z.infer<typeof IdSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;

const validateCreateDTO = validateDTO(CreateSchema, 'body');
const validateIdDTO = validateDTO(IdSchema, 'params');
const validateUpdateDTO = validateDTO(UpdateSchema, 'body');
const validatePaginationDTO = validateDTO(PaginationSchema, 'query');

export { validateCreateDTO, validateIdDTO, validateUpdateDTO, validatePaginationDTO };