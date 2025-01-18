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
router.post(
	'/verify',
	firebaseAuthMiddleware,
	asyncHandler(authController.getCurrentUser)
);
router.post(
	'/refreshtoken',
	firebaseAuthMiddleware,
	asyncHandler(authController.refreshToken)
);

router.post(
	'/logout',
	firebaseAuthMiddleware,
	asyncHandler(authController.logout)
);

router.post('/set-tokens', (req, res) => {
	console.log('set-tokens ---->');
	const { idToken, refreshToken } = req.body;
	console.log('set-tokens ---->', idToken, refreshToken);

	// Set HTTP-only cookies
	res.cookie('idToken', idToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 15 * 60 * 1000, // 15 minutes
	});

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 15 * 60 * 1000,
	});

	res.status(200).json({ success: true });
});

export default router;
