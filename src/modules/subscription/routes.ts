import { config } from '@/_core/config/dotenv.config';
import { asyncHandler } from '@/_core/helper/asyncHandler/index';
import { validatePaginationDTO } from '@/_core/helper/validateZodSchema/Pagnination.dto';
import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';
import { subscriptionController } from '.';
import {
	validateCreateDTO,
	validateIdDTO,
	validateUpdateDTO,
} from './subscription.dto';

const router = createRouter(__filename);

router.use(
	createHATEOASMiddleware(router, {
		autoIncludeSameRoute: true,
		baseUrl: config.baseUrl,
		includePagination: true,
		customLinks: {
			documentation: (_req) => ({
				rel: 'documentation',
				href: config.baseUrl + '/docs',
				method: 'GET',
				title: 'API Documentation',
			}),
		},
	})
);

router.post(
	'/',
	validateCreateDTO,
	asyncHandler(subscriptionController.create)
);
router.get('/me', asyncHandler(subscriptionController.getMySubscriptions));

router.get(
	'/',
	validatePaginationDTO,
	asyncHandler(subscriptionController.getAll)
);
router.get('/:id', validateIdDTO, asyncHandler(subscriptionController.getById));
router.patch(
	'/:id',
	validateIdDTO,
	validateUpdateDTO,
	asyncHandler(subscriptionController.update)
);
router.delete(
	'/:id',
	validateIdDTO,
	asyncHandler(subscriptionController.delete)
);
router.post(
	'/:id/cancel',
	validateIdDTO,
	asyncHandler(subscriptionController.cancelSubscription)
);

export default router;
