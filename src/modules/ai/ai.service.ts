import { Service } from 'typedi';
import { BaseService } from "../_base/crud/BaseService";
import type { IAIRequest } from "./ai.interface";
import type AIRepository from "./ai.repository";
import { OpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

@Service()
class AIService extends BaseService<IAIRequest> {
    private model: OpenAI;

    constructor(protected readonly repository: AIRepository) {
        super(repository);
        this.model = new OpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            temperature: 0.7,
        });
    }

    async generateResponse(prompt: string, temperature?: number, maxTokens?: number): Promise<string> {
        try {
            // Create a chat prompt template
            const template = ChatPromptTemplate.fromTemplate(`{input}`);
            
            // Create output parser
            const outputParser = new StringOutputParser();

            // Create the chain
            const chain = template.pipe(this.model).pipe(outputParser);

            // Run the chain
            const response = await chain.invoke({
                input: prompt,
            });

            return response;
        } catch (error) {
            console.error('Error generating AI response:', error);
            throw error;
        }
    }

    async processRequest(data: Omit<IAIRequest, "id">): Promise<IAIRequest> {
        try {
            // Generate AI response
            const response = await this.generateResponse(
                data.prompt,
                data.temperature,
                data.maxTokens
            );

            // Create record with response
            const record = await this.create({
                ...data,
                response,
            });

            return record as IAIRequest;
        } catch (error) {
            console.error('Error processing AI request:', error);
            throw error;
        }
    }
}

export default AIService;