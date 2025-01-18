import type { NextFunction, Request, Response } from "express";
import admin from "firebase-admin";
import _ERROR from "../helper/http-status/error/index";

// Ensure Firebase is initialized
console.log("✅ Firebase Admin is being initialized");

if (!admin?.apps?.length) {
  console.log("ℹ️ No Firebase apps detected. Initializing now...");
  admin?.initializeApp();
} else {
  console.log("✅ Firebase Admin is already initialized");
}

/**
 * Middleware to authenticate Firebase token from cookies
 */
// Fonction pour obtenir les tokens des cookies
export function getTokenCookies(req: Request) {
  const cookies = req.headers?.cookie?.split('; ') || [];
  const idToken = cookies.find(cookie => cookie.startsWith('idToken='))?.split('=')[1] || '';
  const refreshToken = cookies.find(cookie => cookie.startsWith('refreshToken='))?.split('=')[1] || '';
  return { idToken, refreshToken };
}

export async function firebaseAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { idToken } = getTokenCookies(req);
  // console.log("req get", req);

  const token = idToken || req.headers.authorization?.split(" ")[1];
  // console.log("token get", token);
  if (!token) {
    return new _ERROR.UnauthorizedError({
      message: "Unauthorized: No token provided",
    }).send(res, next);
  }

  try {
    const decodedToken: admin.auth.DecodedIdToken = await admin
      .auth()
      .verifyIdToken(token);
    (req as any).user = decodedToken; // Attacher les informations de l'utilisateur à la requête
    next(); // Passer au middleware ou au gestionnaire de route suivant
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    return new _ERROR.UnauthorizedError({
      message: "Unauthorized: Invalid token",
    }).send(res, next);
  }
}

