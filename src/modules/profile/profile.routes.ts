// profile.routes.ts
import { createHATEOASMiddleware, createRouter } from 'express-route-tracker';

import {
	validateUpdateProfileDTO,
	validateUpdatePasswordDTO,
} from './profile.dto';
import { asyncHandler } from '@/_core/helper/asyncHandler';
import { firebaseAuthMiddleware } from '@/_core/middleware/auth.middleware';
import { config } from '@/_core/config/dotenv.config';
import { profileController } from '.';

const router = createRouter(__filename);

router.use(
	createHATEOASMiddleware(router, {
		autoIncludeSameRoute: true,
		baseUrl: config.baseUrl,
		includePagination: true,
	})
);

router.put(
	'/',
	firebaseAuthMiddleware,
	validateUpdateProfileDTO,
	asyncHandler(profileController.updateProfile)
);

router.post(
	'/password',
	firebaseAuthMiddleware,
	validateUpdatePasswordDTO,
	asyncHandler(profileController.updatePassword)
);

router.post(
	'/link/google',
	firebaseAuthMiddleware,
	asyncHandler(profileController.linkGoogleAccount)
);

router.post(
	'/unlink/:providerId',
	firebaseAuthMiddleware,
	asyncHandler(profileController.unlinkProvider)
);

router.post(
	'/notifications/toggle',
	firebaseAuthMiddleware,
	asyncHandler(profileController.toggleNotification)
);

export default router;
