import AuthRepository from './auth.repository';
import AuthService from './auth.service';
import AuthController from './auth.controller';
import { contactService } from '@/modules/contact/contact.module';

class AuthModule {
    public authRepository: AuthRepository;
    public authService: AuthService;
    public authController: AuthController;

    constructor() {
        this.authRepository = new AuthRepository();
        this.authService = new AuthService(this.authRepository, contactService);
        this.authController = new AuthController(this.authService);
    }
}

const authModule = new AuthModule();

export const { authController, authService, authRepository } = authModule;
