import { Service } from 'typedi';
import { BaseAIService } from '../_core/baseAIService';
import AIRepository from '../ai.repository';
import PineconeService from '../vector-store/pinecone';

@Service()
export class OpenAIService extends BaseAIService {
	constructor(repository: AIRepository, pineconeService: PineconeService) {
		super(repository, pineconeService, {
			apiKey: process.env.OPENAI_API_KEY!,
			temperature: 0.7,
		});
	}
}
