

import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';
import { asyncHandler } from '@/_core/helper/asyncHandler/index';
import { config } from '@/_core/config/dotenv.config';
import { firebaseAuthMiddleware } from '@/_core/middleware/auth.middleware';
import { contactController } from './contact.module';
import { validateCreateDTO, validateIdDTO, validatePaginationDTO, validateUpdateDTO } from './contact.dto';

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
router.post('/', validateCreateDTO, asyncHandler(contactController.create));
router.get('/', validatePaginationDTO, asyncHandler(contactController.getAll));
router.get('/:id', firebaseAuthMiddleware, validateIdDTO, asyncHandler(contactController.getById));
// router.put('/:id', firebaseAuthMiddleware,validateIdDTO, validateCreateDTO, asyncHandler(contactController.replace)); //todo
router.patch('/:id', firebaseAuthMiddleware, validateIdDTO, validateUpdateDTO, asyncHandler(contactController.update));
router.delete('/:id', firebaseAuthMiddleware, validateIdDTO, asyncHandler(contactController.delete));

export default router;
