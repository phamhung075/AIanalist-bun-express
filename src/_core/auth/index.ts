import { Container } from 'typedi';
import AuthController from './auth.controller';
import { AuthRepository } from './auth.repository';
import AuthService from './auth.service';

export const authService = Container.get(AuthService);
export const authController = Container.get(AuthController);
export const authRepository = Container.get(AuthRepository);
