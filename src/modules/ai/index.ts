import { Container } from 'typedi';
import AIController from './ai.controller';
import AIRepository from './ai.repository';
import AIService from './ai.service';
import PineconeService from './vector-store/pinecone';

Container.set(AIRepository, new AIRepository());
Container.set(
	AIService,
	new AIService(Container.get(AIRepository), Container.get(PineconeService))
);
Container.set(AIController, new AIController(Container.get(AIService)));

export const aiService = Container.get(AIService);
export const aiController = Container.get(AIController);
export const aiRepository = Container.get(AIRepository);
