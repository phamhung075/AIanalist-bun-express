import { Container } from 'typedi';
import { AIController } from './ai.controller';
import { AIRepository } from './ai.repository';
import { AIService } from './ai.service';

export const aiService = Container.get(AIService);
export const aiController = Container.get(AIController);
export const aiRepository = Container.get(AIRepository);
