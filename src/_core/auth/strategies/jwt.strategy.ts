import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to validate JWT and attach payload to request
 */
export function jwtStrategyMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer header

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: No token provided',
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
        (req as any).user = payload; // Attach the decoded payload to req.user
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('JWT Validation Error:', error);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid or expired token',
        });
    }
}
