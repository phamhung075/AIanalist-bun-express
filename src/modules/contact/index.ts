

import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';
import { asyncHandler } from '@/_core/helper/asyncHandler/index';
import { config } from '@/_core/config/dotenv.config';
import { validateCreateDTO, createHandler, getAllsHandler, validateIdDTO, getByIdHandler, updateHandler, validateUpdateDTO, deleteHandler } from './contact.handler';
import { firebaseAuthMiddleware } from '@/_core/middleware/auth.middleware';

// Create router with source tracking
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

// Define routes without baseApi prefix
router.post('/', validateCreateDTO, asyncHandler(createHandler));
router.get('/', asyncHandler(getAllsHandler));
router.get('/:id', firebaseAuthMiddleware, validateIdDTO, asyncHandler(getByIdHandler));
router.put('/:id', firebaseAuthMiddleware,validateIdDTO, validateCreateDTO, asyncHandler(updateHandler));
router.patch('/:id', firebaseAuthMiddleware, validateIdDTO, validateUpdateDTO, asyncHandler(updateHandler));
router.delete('/:id', firebaseAuthMiddleware, validateIdDTO, asyncHandler(deleteHandler));

export default router;
