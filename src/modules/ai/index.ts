import { config } from '@/_core/config/dotenv.config';
import { asyncHandler } from '@/_core/helper/asyncHandler/index';
import { validatePaginationDTO } from '@/_core/helper/validateZodSchema/Pagnination.dto';
import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';
import { validateAIRequestDTO } from './ai.dto';
import { aiController } from './ai.module';
import { validateContentLength } from '@/_core/middleware/validateContentLength.middleware';

const router = createRouter(__filename);

router.use(createHATEOASMiddleware(router, {
    autoIncludeSameRoute: true,
    baseUrl: config.baseUrl,
    includePagination: true,
    customLinks: {
        documentation: (_req) => ({
            rel: 'documentation',
            href: config.baseUrl+'/docs',
            method: 'GET',
            'title': 'API Documentation'
        })
    }
}));


// AI Routes
router.post('/generate', validateAIRequestDTO, asyncHandler(aiController.generateResponse));
router.get('/', validatePaginationDTO, asyncHandler(aiController.getAll));
router.get('/:id', asyncHandler(aiController.getById));
router.get('/chat/:chatId/history', asyncHandler(aiController.getChatHistory));

export default router;