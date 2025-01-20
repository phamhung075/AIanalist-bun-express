import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  type UserCredential,
  getAuth as getClientAuth, // Renamed for clarity
} from "firebase/auth";

import {
  getAuth as getAdminAuth, // If needed
  UserRecord,
  type DecodedIdToken,
} from "firebase-admin/auth";

import { firebaseAdminAuth } from "../database/firebase-admin-sdk/index";
import _ERROR from "../helper/http-status/error/index";
import type { IAuth } from "./auth.interface";
import { Service } from "typedi";

@Service()
class AuthRepository {
  private isTestEnvironment: boolean;
  private clientAuth; // For client-side operations
  private adminAuth; // For admin operations

  constructor() {
    this.isTestEnvironment = process.env.NODE_ENV === "test";
    this.clientAuth = getClientAuth(); // Client SDK auth
    this.adminAuth = firebaseAdminAuth; // Admin SDK auth
  }

  async createUser(account: IAuth): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.clientAuth, // Use client auth
        account.email.toLowerCase(),
        account.password
      );

      return userCredential;
    } catch (error: any) {
      console.error("Create user error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          throw new _ERROR.ConflictError({
            message: "Email is already in use",
          });
        case "auth/invalid-email":
          throw new _ERROR.BadRequestError({ message: "Invalid email format" });
        case "auth/weak-password":
          throw new _ERROR.BadRequestError({ message: "Password is too weak" });
        case "auth/network-request-failed":
          throw new _ERROR.InternalServerError({
            message: "Network connection failed",
          });
        default:
          throw new _ERROR.InternalServerError({
            message: "Failed to register user",
          });
      }
    }
  }

  async loginUser(
    email: string,
    password: string
  ): Promise<{ idToken: string; refreshToken: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.clientAuth, // Use client auth
        email.toLowerCase(),
        password
      );

      const idToken = await userCredential.user.getIdToken();
      const refreshToken = userCredential.user.refreshToken;

      return { idToken, refreshToken };
    } catch (error: any) {
      console.error("❌ Firebase Login Error:", error);

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new _ERROR.UnauthorizedError({
            message: "Invalid email or password",
          });
        case "auth/network-request-failed":
          throw new _ERROR.InternalServerError({
            message: "Network connection failed",
          });
        default:
          throw new _ERROR.UnauthorizedError({
            message: "Authentication failed",
          });
      }
    }
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    try {
      if (this.isTestEnvironment && token === "test-token") {
        return {
          uid: "test-uid",
          email: "test@example.com",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor((Date.now() + 3600000) / 1000),
          aud: "test-project",
          iss: "https://securetoken.google.com/test-project",
          sub: "test-uid",
          auth_time: Math.floor(Date.now() / 1000),
          firebase: {
            identities: {},
            sign_in_provider: "custom",
          },
        };
      }

      // Use admin auth for token verification
      const decodedToken = await this.adminAuth.verifyIdToken(token);
      return decodedToken;
    } catch (error: any) {
      console.error("❌ Firebase Token Verification Error:", error);
      throw new _ERROR.UnauthorizedError({
        message: "Invalid or expired token",
      });
    }
  }

  async getUserById(uid: string): Promise<UserRecord> {
    try {
      if (this.isTestEnvironment && uid === "test-uid") {
        return {
          uid: "test-uid",
          email: "test@example.com",
          emailVerified: true,
          displayName: "Test User",
          disabled: false,
          metadata: {
            creationTime: new Date().toISOString(),
            lastSignInTime: new Date().toISOString(),
            lastRefreshTime: new Date().toISOString(),
            toJSON: () => ({}),
          },
          providerData: [],
          toJSON: () => ({}),
        } as unknown as UserRecord;
      }

      // Use admin auth for user management
      const userRecord = await this.adminAuth.getUser(uid);
      return userRecord;
    } catch (error: any) {
      console.error("❌ Firebase Get User Error:", error);
      if (error.code === "auth/user-not-found") {
        throw new _ERROR.NotFoundError({ message: "User not found" });
      }
      throw new _ERROR.InternalServerError({
        message: "Failed to get user information",
      });
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<{ idToken: string; refreshToken: string }> {
    try {
      if (this.isTestEnvironment && refreshToken === "test-refresh-token") {
        // Return mock data for testing
        return {
          idToken: "test-id-token",
          refreshToken: "test-refresh-token",
        };
      }

      const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=${process.env.FIREBASE_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        throw new _ERROR.UnauthorizedError({
          message: "Failed to refresh token",
        });
      }

      const data = await response.json();
      return {
        idToken: data.id_token,
        refreshToken: data.refresh_token,
      };
    } catch (error: any) {
      console.error("❌ Firebase Refresh Token Error:", error);
      throw new _ERROR.UnauthorizedError({
        message: "Failed to refresh token",
      });
    }
  }
}

export default AuthRepository;
