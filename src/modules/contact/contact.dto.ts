import { z } from "zod";
import type { CreateSchema, UpdateSchema, IdSchema } from "./contact.validation.js";

export type CreateInput = z.infer<typeof CreateSchema>;
export type UpdateInput = z.infer<typeof UpdateSchema>;
export type IdInput = z.infer<typeof IdSchema>;