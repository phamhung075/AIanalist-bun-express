import { API_CONFIG } from '@/_core/helper/http-status/common/api-config';
import { firebaseAuthMiddleware } from '@middleware/auth.middleware';
import { RequestHandler, Router } from 'express';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
const router: Router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fonction helper pour charger les routes de manière dynamique
const loadRoute = async (path: string) => {
	const module = await import(path);
	return module.default;
};

const welcomeHandler: RequestHandler = (req, res, next) => {
	res.status(200).json({
		message: 'Welcome to AIAnalyst!',
	});
};

const healthCheck: RequestHandler = (req, res, next) => {
	res.status(200).json({
		status: 'ok',
	});
};

const initRoutes = async () => {
	router.post('/', welcomeHandler);
	router.get('/health', healthCheck);

	// Auth routes
	const authRoutePath = resolve(__dirname, '../_core/auth/route.ts');
	// console.log ("loading auth route from :", authRoutePath);
	const authRouter = await loadRoute(authRoutePath);
	router.use(API_CONFIG.PREFIX + '/auth', authRouter);

	// Protected routes
	const contactRoutePath = resolve(__dirname, './contact/route.ts');
	const contactRouter = await loadRoute(contactRoutePath);
	// console.log ("loading contact route from :", contactRouter);
	router.use(
		API_CONFIG.PREFIX + '/contact',
		firebaseAuthMiddleware,
		contactRouter
	);

	// Load AI routes
	const aiRoutePath = resolve(__dirname, './ai/route.ts');
	const aiRouter = await loadRoute(aiRoutePath);
	// console.log("loading AI route from:", aiRoutePath);
	router.use(API_CONFIG.PREFIX + '/ai', firebaseAuthMiddleware, aiRouter);

	//load subscription routes
	const subscriptionRoutePath = resolve(__dirname, './subscription/route.ts');
	const subscriptionRouter = await loadRoute(subscriptionRoutePath);
	console.log('loading subscription route from:', subscriptionRoutePath);
	router.use(
		API_CONFIG.PREFIX + '/subscription',
		firebaseAuthMiddleware,
		subscriptionRouter
	);

	// const tradingRoutePath = resolve(__dirname, "./trading-economics-new/index.ts");
	// const tradingRouter = await loadRoute(tradingRoutePath);
	// console.log ("loading contact route from :", tradingRoutePath);
	// router.use('/api/trading-economics-new', firebaseAuthMiddleware, tradingRouter);
};

// Initialiser les routes
await initRoutes().catch(console.error);

export default router;
