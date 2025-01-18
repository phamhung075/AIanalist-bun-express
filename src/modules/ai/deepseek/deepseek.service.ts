import { Service } from 'typedi';
import { BaseAIService } from '../_core/baseAIService';
import AIRepository from '../ai.repository';
import PineconeService from '../vector-store/pinecone';

@Service()
export class DeepseekService extends BaseAIService {
	constructor(repository: AIRepository, pineconeService: PineconeService) {
		super(repository, pineconeService, {
			apiKey: process.env.DEEPSEEK_API_KEY!,
			baseURL: 'https://api.deepseek.com/v1',
			modelName: 'deepseek-chat',
			temperature: 0.7,
		});
	}
}
