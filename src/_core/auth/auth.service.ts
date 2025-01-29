import { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { UserCredential } from 'firebase/auth';
import { Service } from 'typedi';
import { BindMethods } from '../decorators/bind-methods.decorator';
import _ERROR from '../helper/http-status/error';
import { IRegister } from './auth.interface';
import AuthRepository from './auth.repository';
import { Contact, ContactService } from '@/modules/contact';

@Service()
@BindMethods()
export class AuthService {
	constructor(
		readonly authRepository: AuthRepository,
		readonly contactService: ContactService
	) {}

	async register(registerData: IRegister): Promise<UserCredential> {
		const { email, password, ...contactData } = registerData;

		const userCred = await this.authRepository.createUser({ email, password });

		(await this.contactService.createWithId(userCred.user.uid, {
			...contactData,
			email,
		})) as Contact;

		return userCred;
	}

	async login(
		email: string,
		password: string
	): Promise<{ idToken: string; refreshToken: string }> {
		try {
			console.log(`🔄 Logging in user: ${email}`);

			// Call the repository to perform login
			return (await this.authRepository.loginUser(email, password)) as {
				idToken: string;
				refreshToken: string;
			};
		} catch (error: any) {
			console.error('❌ Login Error:', error);

			if (
				[
					'auth/user-not-found',
					'auth/wrong-password',
					'auth/invalid-credential',
				].includes(error.code)
			) {
				throw new _ERROR.UnauthorizedError({
					message: 'Invalid email or password',
				});
			}

			throw new _ERROR.InternalServerError({
				message: 'Failed to login due to an unexpected error.',
			});
		}
	}

	async verifyToken(token: string): Promise<DecodedIdToken> {
		try {
			const decodedToken = await this.authRepository.verifyIdToken(token);
			console.log(`✅ Token verified successfully: ${decodedToken.uid}`);
			return decodedToken;
		} catch (error) {
			throw new _ERROR.UnauthorizedError({
				message: 'Invalid or expired token',
			});
		}
	}

	async getUser(uid: string): Promise<UserRecord> {
		try {
			console.log(`Fetching user details for UID: ${uid}`);
			const userRecord = await this.authRepository.getUserById(uid);
			console.log(`✅ User details fetched successfully: ${userRecord.email}`);
			return userRecord;
		} catch (error) {
			throw new _ERROR.UnauthorizedError({
				message: 'Failed to fetch user details',
			});
		}
	}

	async refreshToken(
		token: string
	): Promise<{ idToken: string; refreshToken: string }> {
		console.log(`Refreshing token: ${token}`);
		try {
			const decodedToken = await this.authRepository.refreshToken(token);
			return decodedToken;
		} catch (error) {
			throw new _ERROR.UnauthorizedError({
				message: 'Invalid or expired token',
			});
		}
	}
}

export default AuthService;
