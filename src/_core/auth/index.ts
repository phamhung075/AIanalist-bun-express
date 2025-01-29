import { Container } from 'typedi';
import AuthController from './auth.controller';
import AuthRepository from './auth.repository';
import AuthService from './auth.service';
import { contactService } from '@/modules/contact';

Container.set(AuthRepository, new AuthRepository());
Container.set(
	AuthService,
	new AuthService(Container.get(AuthRepository), contactService)
);
Container.set(AuthController, new AuthController(Container.get(AuthService)));

export const authService = Container.get(AuthService);
export const authController = Container.get(AuthController);
export const authRepository = Container.get(AuthRepository);
