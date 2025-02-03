import { Service } from 'typedi';
import AIRepository from '../ai.repository';
import { OpenAIService } from '../openai/openai.service';
import PineconeService from '../vector-store/pinecone';
import { BaseAIService } from './baseAIService';
import { DeepseekService } from '../deepseek/deepseek.service';

export enum AIServiceType {
	OPENAI = 'openai',
	DEEPSEEK = 'deepseek',
}

@Service()
export class AIServiceFactory {
	constructor(
		private repository: AIRepository,
		private pineconeService: PineconeService
	) {}

	createService(type: AIServiceType): BaseAIService {
		switch (type) {
			case AIServiceType.OPENAI:
				return new OpenAIService(this.repository, this.pineconeService);
			case AIServiceType.DEEPSEEK:
				return new DeepseekService(this.repository, this.pineconeService);
			default:
				throw new Error(`Unsupported AI service type: ${type}`);
		}
	}
}
