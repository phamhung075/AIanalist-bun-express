import { Container } from 'typedi';
import AuthController from './auth.controller';
import AuthRepository from './auth.repository';
import AuthService from './auth.service';
import { contactService } from '@/modules/contact';

// Create instances with proper dependency injection
const authRepository = new AuthRepository();
Container.set(AuthRepository, authRepository);

const authService = new AuthService(authRepository, contactService);
Container.set(AuthService, authService);

const authController = new AuthController(authService);
Container.set(AuthController, authController);

// Export the instances
export { authService, authController, authRepository };

// Also export the types/classes for type usage
export { default as AuthController } from './auth.controller';
export { default as AuthRepository } from './auth.repository';
export { default as AuthService } from './auth.service';

export type { AuthTokens, IAuth, IRegister } from './auth.interface';
