import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { UserRecord, type DecodedIdToken } from 'firebase-admin/auth';
import { firebaseClientAuth, firebaseAdminAuth } from '../database/firebase-admin-sdk/index.js';
import _ERROR from '../helper/http-status/error/index.js';
import type { IAuth } from './auth.interface.js';



class AuthRepository {
    async createUser(account: IAuth): Promise<UserCredential> {
        try {
            return await createUserWithEmailAndPassword(firebaseClientAuth, account.email, account.password);
        } catch (error: any) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    throw new _ERROR.ConflictError({ message: 'Email is already in use' });
                case 'auth/invalid-email':
                    throw new _ERROR.BadRequestError({ message: 'Invalid email format' });
                case 'auth/weak-password':
                    throw new _ERROR.BadRequestError({ message: 'Password is too weak' });
                default:
                    throw new _ERROR.InternalServerError({ message: 'Failed to register user' });
            }
        }
    }

    async loginUser(email: string, password: string): Promise<{ idToken: string; refreshToken: string }> {
        try {
            const userCredential = await signInWithEmailAndPassword(firebaseClientAuth, email, password);
            const idToken = await userCredential.user.getIdToken(); // Get fresh idToken
            const refreshToken = userCredential.user.refreshToken;

            return { idToken, refreshToken };
        } catch (error: any) {
            console.error('❌ Firebase Login Error:', error);
            throw new _ERROR.UnauthorizedError({ message: 'Invalid email or password' });
        }
    }

    async verifyIdToken(token: string): Promise<DecodedIdToken> {
        try {
            return await firebaseAdminAuth.verifyIdToken(token);
        } catch (error: any) {
            console.error('❌ Firebase Token Verification Error:', error);
            throw error;
        }
    }

    async getUserById(uid: string): Promise<UserRecord> {
        try {
            return await firebaseAdminAuth.getUser(uid);
        } catch (error: any) {
            console.error('❌ Firebase Get User Error:', error);
            throw error;
        }
    }

    async refreshToken(refreshToken: string): Promise<{ idToken: string; refreshToken: string }> {
        try {
            const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                }),
            });

            if (!response.ok) {
                throw new _ERROR.UnauthorizedError({ message: 'Failed to refresh token' });
            }

            const data = await response.json();
            return {
                idToken: data.id_token,
                refreshToken: data.refresh_token,
            };
        } catch (error: any) {
            console.error('❌ Firebase Refresh Token Error:', error);
            throw new _ERROR.UnauthorizedError({ message: 'Failed to refresh token' });
        }
    }
}

export default AuthRepository;