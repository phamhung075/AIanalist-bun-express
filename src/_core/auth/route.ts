import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';
import { config } from '../config/dotenv.config';
import { asyncHandler } from '../helper/asyncHandler';
import { firebaseAuthMiddleware } from '../middleware/auth.middleware';
import { validateRegisterDTO, validateLoginDTO } from './auth.dto';
import { authController } from '.';

require('express-route-tracker');

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

/**
 * 🔐 User Registration
 */
router.post(
	'/register',
	validateRegisterDTO,
	asyncHandler(authController.register)
);
router.post('/login', validateLoginDTO, asyncHandler(authController.login));
router.get(
	'/current',
	firebaseAuthMiddleware,
	asyncHandler(authController.getCurrentUser)
);
router.get(
	'/verify',
	firebaseAuthMiddleware,
	asyncHandler(authController.getCurrentUser)
);
router.get(
	'/refreshtoken',
	firebaseAuthMiddleware,
	asyncHandler(authController.refreshToken)
);

export default router;
