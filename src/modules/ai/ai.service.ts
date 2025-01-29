import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import Container, { Service } from 'typedi';
import { BaseService } from '../_base/crud/BaseService';
import { AIRequest, IAIRequest } from './ai.interface';
import { AIRepository } from './ai.repository';
import { PineconeService } from './vector-store/pinecone';

@Service()
export class AIService extends BaseService<AIRequest> {
	private model: ChatOpenAI;

	constructor(
		protected readonly repository: AIRepository,
		protected readonly pineconeService: PineconeService
	) {
		super(AIRequest);
		this.model = new ChatOpenAI({
			openAIApiKey: process.env.OPENAI_API_KEY,
			temperature: 0.7,
		});
	}

	baseRepository(): AIRepository {
		return Container.get(AIRepository);
	}

	vectorRepository(): PineconeService {
		return Container.get(PineconeService);
	}

	async generateResponse(
		prompt: string,
		chatId?: string,
		temperature?: number,
		maxTokens?: number
	): Promise<string> {
		try {
			this.model = new ChatOpenAI({
				openAIApiKey: process.env.OPENAI_API_KEY,
				temperature: temperature || 0.7,
				maxTokens: maxTokens || 1000,
				modelName: 'gpt-3.5-turbo', // or your preferred model
			});

			const template = ChatPromptTemplate.fromTemplate(`{input}`);
			const outputParser = new StringOutputParser();
			const chain = template.pipe(this.model).pipe(outputParser);

			const relevantHistory = chatId
				? await this.vectorRepository().similaritySearch(prompt, 5, { chatId })
				: await this.vectorRepository().similaritySearch(prompt, 3);

			const contextualPrompt =
				relevantHistory.length > 0
					? `Previous conversation:\n${relevantHistory
							.map((doc) => doc.pageContent)
							.join('\n')}\n\nCurrent prompt: ${prompt}`
					: prompt;

			const response = await chain.invoke({
				input: contextualPrompt,
			});

			if (!response) {
				throw new Error('No response generated from OpenAI');
			}

			await this.vectorRepository().addDocument(
				`User: ${prompt}\nAssistant: ${response}`,
				{
					timestamp: new Date().toISOString(),
					chatId: chatId || crypto.randomUUID(),
					type: 'message',
				}
			);

			return response;
		} catch (error) {
			console.error('Error generating AI response:', error);
			throw error;
		}
	}

	async processRequest(data: AIRequest): Promise<AIRequest> {
		try {
			const finalChatId = data.chatId || crypto.randomUUID();

			const response = await this.generateResponse(
				data.prompt as string,
				finalChatId, // Pass the same ID
				data.temperature,
				data.maxTokens
			);

			const record = await this.create({
				...data,
				response,
				chatId: finalChatId, // Use the same ID
			});

			return record as IAIRequest;
		} catch (error) {
			console.error('Error processing AI request:', error);
			throw error;
		}
	}

	async getChatHistory(
		chatId: string,
		page: number = 1,
		limit: number = 10
	): Promise<any[]> {
		try {
			const history = await this.vectorRepository().similaritySearch(
				'',
				limit * page,
				{
					chatId,
					type: 'message',
				}
			);
			return history;
		} catch (error) {
			console.error('Error fetching chat history:', error);
			throw error;
		}
	}
}
