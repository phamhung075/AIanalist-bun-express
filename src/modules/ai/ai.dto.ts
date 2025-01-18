import { z } from "zod";
import { AIRequestSchema } from "./ai.validation";
import { validateDTO } from "@/_core/helper/validateZodSchema";

export type AIRequestInput = z.infer<typeof AIRequestSchema>;
export const validateAIRequestDTO = validateDTO(AIRequestSchema, 'body');