import { Container, Service } from 'typedi';
import AuthController from './auth.controller';
import AuthService from './auth.service';
import { AuthRepository } from './auth.repository';
import { contactService } from '@/modules/contact';

@Service()
class AuthModule {
	constructor(
		public authService: AuthService,
		public authController: AuthController,
		public authRepository: AuthRepository
	) {}
}

export const authModule = Container.get(AuthModule);
export const authService = Container.get(AuthService);
export const authController = Container.get(AuthController);
export const authRepository = Container.get(AuthRepository);
