import { Container } from 'typedi';
import AIController from './ai.controller';
import AIRepository from './ai.repository';
import AIService from './ai.service';
import PineconeService from './vector-store/pinecone';

// Créer des instances avec une injection de dépendance appropriée
const aiRepository = Container.get(AIRepository);
const pineconeService = Container.get(PineconeService);
const aiService = Container.get(AIService);
const aiController = Container.get(AIController);

// Exporter les instances
export { aiService, aiController, aiRepository, pineconeService };
// Also export the types/classes for type usage
export { default as AIController } from './ai.controller';
export { default as AIRepository } from './ai.repository';
export { default as AIService } from './ai.service';
export { default as PineconeService } from './vector-store/pinecone';

export type { AIRequest, IAIRequest, IAIRequestCreate } from './ai.interface';
