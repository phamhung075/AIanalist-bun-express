import { firebaseAuthMiddleware } from '@middleware/auth.middleware.js';
import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = Router();

// Fonction helper pour charger les routes de manière dynamique
const loadRoute = async (path: string) => {
    const module = await import(path);
    return module.default;
};

// Route de base
router.post('/', (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(200).json({
        message: 'Welcome to AIAnalyst!'
    });
});

router.get('/health', (_req: Request, res: Response, _next: NextFunction) => {
    return res.status(200).json({
        status: 'ok'
    });
});


// Initialisation des routes de manière asynchrone
const initRoutes = async () => {
    // Auth routes
    const authRoutePath = resolve(__dirname, "../_core/auth/index.ts");
    console.log ("loading auth route from :", authRoutePath);
    const authRouter = await loadRoute(authRoutePath);
    router.use('/api/auth', authRouter);

    // Protected routes
    const contactRoutePath = resolve(__dirname, "./contact/index.ts");    
    const contactRouter = await loadRoute(contactRoutePath);
    console.log ("loading contact route from :", contactRouter);
    router.use('/api/contact', firebaseAuthMiddleware, contactRouter);

    // const tradingRoutePath = resolve(__dirname, "./trading-economics-new/index.ts");    
    // const tradingRouter = await loadRoute(tradingRoutePath);
    // console.log ("loading contact route from :", tradingRoutePath);
    // router.use('/api/trading-economics-new', firebaseAuthMiddleware, tradingRouter);
};

// Initialiser les routes
await initRoutes().catch(console.error);

export default router;