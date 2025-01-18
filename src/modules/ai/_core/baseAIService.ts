// baseAIService.ts
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Service } from 'typedi';
import { BaseService } from '../../_base/crud/BaseService';
import { AIRequest, IAIRequest } from './../ai.interface';
import AIRepository from './../ai.repository';
import PineconeService from './../vector-store/pinecone';

interface AIModelConfig {
	apiKey: string;
	baseURL?: string;
	modelName?: string;
	temperature?: number;
	maxTokens?: number;
}

@Service()
export abstract class BaseAIService extends BaseService<AIRequest> {
	protected model: ChatOpenAI;

	constructor(
		protected readonly repository: AIRepository,
		protected readonly pineconeService: PineconeService,
		config: AIModelConfig
	) {
		super(repository);
		this.model = new ChatOpenAI({
			openAIApiKey: config.apiKey,
			temperature: config.temperature ?? 0.7,
			maxTokens: config.maxTokens ?? 500,
			modelName: config.modelName,
			configuration: config.baseURL
				? {
						baseURL: config.baseURL,
				  }
				: undefined,
		});
	}

	protected async generateResponse(
		prompt: string,
		chatId?: string,
		temperature?: number,
		maxTokens?: number
	): Promise<string> {
		try {
			if (temperature !== undefined || maxTokens !== undefined) {
				this.model.temperature = temperature ?? 0.7;
				this.model.maxTokens = maxTokens ?? 500;
			}

			const template = ChatPromptTemplate.fromTemplate(`{input}`);
			const outputParser = new StringOutputParser();
			const chain = template.pipe(this.model).pipe(outputParser);

			const relevantHistory = chatId
				? await this.pineconeService.similaritySearch(prompt, 5, { chatId })
				: await this.pineconeService.similaritySearch(prompt, 3);

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
				throw new Error('No response generated');
			}

			await this.pineconeService.addDocument(
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
				finalChatId,
				data.temperature,
				data.maxTokens
			);

			const record = await this.create({
				...data,
				response,
				chatId: finalChatId,
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
			const history = await this.pineconeService.similaritySearch(
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
