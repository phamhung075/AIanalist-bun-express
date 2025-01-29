import { Container } from 'typedi';
import AIController from './ai.controller';
import AIRepository from './ai.repository';
import AIService from './ai.service';
import PineconeService from './vector-store/pinecone';

// Créer des instances avec une injection de dépendance appropriée
const aiRepository = new AIRepository();
Container.set(AIRepository, aiRepository);

const pineconeService = new PineconeService();
Container.set(PineconeService, pineconeService);

const aiService = new AIService(aiRepository, pineconeService);
Container.set(AIService, aiService);

const aiController = new AIController(aiService);
Container.set(AIController, aiController);

// Exporter les instances
export { aiService, aiController, aiRepository, pineconeService };
// Also export the types/classes for type usage
export { default as AIController } from './ai.controller';
export { default as AIRepository } from './ai.repository';
export { default as AIService } from './ai.service';
export { default as PineconeService } from './vector-store/pinecone';

export type { AIRequest, IAIRequest, IAIRequestCreate } from './ai.interface';
