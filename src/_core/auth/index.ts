import { createHATEOASMiddleware, createRouter } from "express-route-tracker";
import { config } from "../config/dotenv.config.js";
import { asyncHandler } from "../helper/asyncHandler/index.js";
import { firebaseAuthMiddleware } from "../middleware/auth.middleware.js";
import { getCurrentUserHandler, loginHandler, refreshTokenHandler, registerHandler, validateLoginDTO, validateRegisterDTO } from "./auth.handler.js";

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
