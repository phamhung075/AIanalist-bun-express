import { Container } from 'typedi';
import AuthController from './auth.controller';
import AuthRepository from './auth.repository';
import AuthService from './auth.service';
import { contactService } from '@/modules/contact';

const authRepository = Container.get(AuthRepository);
const authService = Container.get(AuthService);
const authController = Container.get(AuthController);

// Export the instances
export { authService, authController, authRepository };

// Also export the types/classes for type usage
export { default as AuthController } from './auth.controller';
export { default as AuthRepository } from './auth.repository';
export { default as AuthService } from './auth.service';

export type { AuthTokens, IAuth, IRegister } from './auth.interface';
