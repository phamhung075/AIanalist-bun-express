import { Container, Service } from 'typedi';
import { AIController } from './ai.controller';
import { AIRepository } from './ai.repository';
import { AIService } from './ai.service';

@Service()
class AIModule {
	constructor(
		public aiService: AIService,
		public aiController: AIController,
		public aiRepository: AIRepository
	) {}
}

export const aiModule = Container.get(AIModule);
export const aiService = Container.get(AIService);
export const aiController = Container.get(AIController);
export const aiRepository = Container.get(AIRepository);
