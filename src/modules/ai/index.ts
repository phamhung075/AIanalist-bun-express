import { Container } from 'typedi';
import AIController from './ai.controller';
import AIRepository from './ai.repository';
import PineconeService from './vector-store/pinecone';
import { OpenAIService } from './openai/openai.service';
import { DeepseekService } from './deepseek/deepseek.service';

// Créer des instances avec une injection de dépendance appropriée
const aiRepository = Container.get(AIRepository);
const pineconeService = Container.get(PineconeService);
const openAIService = Container.get(OpenAIService);
const deepseekService = Container.get(DeepseekService);
const aiController = Container.get(AIController);

// Exporter les instances
export {
	openAIService,
	deepseekService,
	aiController,
	aiRepository,
	pineconeService,
};
// Also export the types/classes for type usage
export { default as AIController } from './ai.controller';
export { default as AIRepository } from './ai.repository';
export { default as PineconeService } from './vector-store/pinecone';

export type { AIRequest, IAIRequest, IAIRequestCreate } from './ai.interface';
