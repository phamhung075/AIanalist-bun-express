import { config } from '@/_core/config/dotenv.config';
import { asyncHandler } from '@/_core/helper/asyncHandler/index';
import { validatePaginationDTO } from '@/_core/helper/validateZodSchema/Pagnination.dto';
import { firebaseAuthMiddleware } from '@/_core/middleware/auth.middleware';
import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';
import {
	validateCreateDTO,
	validateIdDTO,
	validateUpdateDTO,
} from './account.dto';
import { AccountPermission } from './account.interface';
import { accountController, requirePermission } from '.';

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

// Public routes
router.post('/', validateCreateDTO, asyncHandler(accountController.create));

// Protected routes
router.get(
	'/me',
	firebaseAuthMiddleware,
	asyncHandler(accountController.getMyAccount)
);

// Admin routes with permission checks
router.get(
	'/',
	firebaseAuthMiddleware,
	requirePermission(AccountPermission.VIEW_USERS),
	validatePaginationDTO,
	asyncHandler(accountController.getAll)
);

router.get(
	'/:id',
	firebaseAuthMiddleware,
	requirePermission(AccountPermission.VIEW_USERS),
	validateIdDTO,
	asyncHandler(accountController.getById)
);

router.patch(
	'/:id',
	firebaseAuthMiddleware,
	requirePermission(AccountPermission.MANAGE_USERS),
	validateIdDTO,
	validateUpdateDTO,
	asyncHandler(accountController.update)
);

router.delete(
	'/:id',
	firebaseAuthMiddleware,
	requirePermission(AccountPermission.MANAGE_USERS),
	validateIdDTO,
	asyncHandler(accountController.delete)
);

// Role management
router.patch(
	'/:id/roles',
	firebaseAuthMiddleware,
	requirePermission(AccountPermission.MANAGE_USERS),
	validateIdDTO,
	asyncHandler(accountController.updateRoles)
);

// Contact linking
router.post(
	'/:id/contact',
	firebaseAuthMiddleware,
	requirePermission(AccountPermission.MANAGE_USERS),
	validateIdDTO,
	asyncHandler(accountController.linkContact)
);

// Subscription management
router.post(
	'/:id/subscriptions',
	firebaseAuthMiddleware,
	requirePermission(AccountPermission.MANAGE_SUBSCRIPTIONS),
	validateIdDTO,
	asyncHandler(accountController.addSubscription)
);

export default router;
