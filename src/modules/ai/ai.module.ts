import { Container } from 'typedi';
import AIController from './ai.controller';
import AIRepository from './ai.repository';
import AIService from './ai.service';
import PineconeService from './vector-store/pinecone.service';

class AIModule {
    private static instance: AIModule;
    public aiController: AIController;
    public aiService: AIService;
    public aiRepository: AIRepository;
    public pineConeService: PineconeService;

    private constructor() {
        this.aiRepository = new AIRepository();
        Container.set('AIRepository', this.aiRepository);

        this.pineConeService = new PineconeService();
        Container.set('PineconeService', this.pineConeService);

        this.aiService = new AIService(this.aiRepository, this.pineConeService);
        Container.set('AIService', this.aiService);

        this.aiController = new AIController(this.aiService);
        Container.set('AIController', this.aiController);
    }

    public static getInstance(): AIModule {
        if (!AIModule.instance) {
            AIModule.instance = new AIModule();
        }
        return AIModule.instance;
    }
}

const aiModule = AIModule.getInstance();
export const { aiController, aiService, aiRepository, pineConeService } = aiModule;
