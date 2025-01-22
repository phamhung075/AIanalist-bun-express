import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import type { AIRequestInput } from './ai.dto';
import type { IAIRequest } from './ai.interface';
import type AIService from './ai.service';
import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import type { Response, NextFunction } from 'express';
import type { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import _SUCCESS from '@/_core/helper/http-status/success';

@Service()
@BindMethods()
class AIController extends BaseController<IAIRequest, AIRequestInput, Partial<AIRequestInput>> {
    constructor(protected readonly aiService: AIService) {
        super(aiService);
    }

    async generateResponse(req: CustomRequest<AIRequestInput>, res: Response, next: NextFunction) {
        try {
            const result = await this.aiService.processRequest(req.body);

            return new _SUCCESS.OkSuccess({
                message: 'AI response generated successfully',
                data: result,
            }).send(res, next);
        } catch (error) {
            next(error);
        }
    }
}

export default AIController;