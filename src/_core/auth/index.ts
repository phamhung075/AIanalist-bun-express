import { createHATEOASMiddleware, createRouter } from "express-route-tracker";
import { config } from "../config/dotenv.config";
import { asyncHandler } from "../helper/asyncHandler";
import { firebaseAuthMiddleware } from "../middleware/auth.middleware";
import { validateRegisterDTO, registerHandler, validateLoginDTO, loginHandler, getCurrentUserHandler, refreshTokenHandler } from "./auth.handler";


// import { config } from '../config/dotenv.config';
require("express-route-tracker")


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

/**
 * 🔐 User Registration
 */
router.post('/registre', validateRegisterDTO, asyncHandler(registerHandler));
router.post('/login', validateLoginDTO, asyncHandler(loginHandler));
router.get('/current', firebaseAuthMiddleware, asyncHandler(getCurrentUserHandler));
router.get('/verify', firebaseAuthMiddleware, asyncHandler(getCurrentUserHandler));
router.get('/refreshtoken', firebaseAuthMiddleware, asyncHandler(refreshTokenHandler));


export default router;
