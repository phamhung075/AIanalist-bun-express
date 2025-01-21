

import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';
import { asyncHandler } from '@/_core/helper/asyncHandler/index';
import { config } from '@/_core/config/dotenv.config';
import { firebaseAuthMiddleware } from '@/_core/middleware/auth.middleware';
import { contactController } from './contact.module';
import { validateCreateDTO, validateIdDTO,  validateUpdateDTO } from './contact.dto';
import { validatePaginationDTO } from '@/_core/helper/validateZodSchema/Pagnination.dto';

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
router.get('/', validatePaginationDTO, asyncHandler(contactController.getAll)); // pagination possible http://localhost:3333/api/contact?page=1&limit=2&sort=createdAt&order=desc
router.get('/:id', firebaseAuthMiddleware, validateIdDTO, asyncHandler(contactController.getById));
// router.put('/:id', firebaseAuthMiddleware,validateIdDTO, validateCreateDTO, asyncHandler(contactController.replace)); //todo
router.patch('/:id', firebaseAuthMiddleware, validateIdDTO, validateUpdateDTO, asyncHandler(contactController.update));
router.delete('/:id', firebaseAuthMiddleware, validateIdDTO, asyncHandler(contactController.delete));

export default router;
