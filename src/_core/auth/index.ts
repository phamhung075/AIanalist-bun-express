import { Container, Service } from 'typedi';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import { AuthRepository } from './auth.repository';
import { contactService } from '@/modules/contact';

Container.set(AuthRepository, new AuthRepository());
Container.set(
	AuthService,
	new AuthService(Container.get(AuthRepository), contactService)
);
Container.set(AuthController, new AuthController(Container.get(AuthService)));

export const authModule = {
	authRepository: Container.get(AuthRepository),
	authService: Container.get(AuthService),
	authController: Container.get(AuthController),
};

export const { authRepository, authService, authController } = authModule;
