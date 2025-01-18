import { z } from 'zod';

export const AIRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
});

export const AIResponseSchema = z.object({
  id: z.string(),
  response: z.string(),
});