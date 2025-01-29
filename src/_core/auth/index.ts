import AuthRepository from './auth.repository';
import AuthService from './auth.service';
import AuthController from './auth.controller';
import { Container } from 'typedi';
import { contactService } from '@/modules/contact';

class AuthModule {
	private static instance: AuthModule;

	public authRepository: AuthRepository;
	public authService: AuthService;
	public authController: AuthController;

	private constructor() {
		// Initialize repository
		this.authRepository = new AuthRepository();
		Container.set('AuthRepository', this.authRepository);

		// Initialize service with dependencies
		this.authService = new AuthService(this.authRepository, contactService);
		Container.set('AuthService', this.authService);

		// Initialize controller
		this.authController = new AuthController(this.authService);
		Container.set('AuthController', this.authController);
	}

	public static getInstance(): AuthModule {
		if (!AuthModule.instance) {
			AuthModule.instance = new AuthModule();
		}
		return AuthModule.instance;
	}
}

const authModule = AuthModule.getInstance();

export const { authController, authService, authRepository } = authModule;
