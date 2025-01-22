export interface IAIRequest {
  id?: string;
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  createdAt?: Date;
  updatedAt?: Date;
  response?: string;
}
