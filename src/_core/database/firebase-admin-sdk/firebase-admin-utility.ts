import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAdminAuth, firebaseClientAuth } from './index.js';
import { getAuth } from "firebase-admin/auth";


// Utility to verify and refresh token
export const verifyAndRefreshToken = async (idToken: string) => {
    try {
        // Verify the token
        const decodedToken = await firebaseAdminAuth.verifyIdToken(idToken, true);
        
        // Check if token is close to expiring (within 5 minutes)
        const tokenExp = decodedToken.exp * 1000; // Convert to milliseconds
        const fiveMinutes = 5 * 60 * 1000;
        
        if (Date.now() + fiveMinutes >= tokenExp) {
            // Token is about to expire, get current user
            const currentUser = firebaseClientAuth.currentUser;
            if (currentUser) {
                // Force token refresh
                const newToken = await currentUser.getIdToken(true);
                return newToken;
            }
        }
        
        return idToken;
    } catch (error: any) {
        if (error.code === 'auth/id-token-expired') {
            // Token is expired, force refresh
            const currentUser = firebaseClientAuth.currentUser;
            if (currentUser) {
                const newToken = await currentUser.getIdToken(true);
                return newToken;
            }
        }
        throw error;
    }
};

// Auth state observer
export const initAuthStateObserver = () => {
    onAuthStateChanged(firebaseClientAuth, async (user) => {
        if (user) {
            // User is signed in, get fresh token
            try {
                await user.getIdToken(true);
            } catch (error) {
                console.error('Error refreshing token:', error);
            }
        }
    });
};

// Middleware to check and refresh token
export const authMiddleware = async (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('No token provided');
        }

        const idToken = authHeader.split('Bearer ')[1];
        const validToken = await verifyAndRefreshToken(idToken);
        
        // Attach the verified token to the request
        req.token = validToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};