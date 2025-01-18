import type { Request } from 'express';
import type { DecodedIdToken } from "firebase-admin/auth";

// Interface de base pour le contexte utilisateur
export interface UserContext {
    user?: DecodedIdToken;
}

// Extension de Request avec le contexte utilisateur
export interface ExtendedUserContextRequest extends Request, UserContext {}

// Type par défaut si aucun type n'est spécifié
type FallbackBody = { [key: string]: any };

// Interface CustomRequest générique
export interface CustomRequest<T = FallbackBody> extends Omit<ExtendedUserContextRequest, 'body'> {
    startTime?: number;
    timestamp?: string;
    path: string;
    body: T;
}

// Type d'aide pour créer une requête typée
export type TypedRequest<T> = CustomRequest<T>;