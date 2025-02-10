import {
	AccountRole,
	AccountService,
	PermissionHelper,
} from '@/modules/account';
import { ContactService, IContact } from '@/modules/contact';
import { formatPhoneToE164 } from '@/utils/phone-formatter';
import { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { Inject, Service } from 'typedi';
import { BindMethods } from '../decorators/bind-methods.decorator';
import _ERROR from '../helper/http-status/error';
import { IRegister, IUserProfileUpdate } from './auth.interface';

@Service()
@BindMethods()
export class AuthService {
	constructor(
		@Inject('AUTH_ADAPTER')
		private readonly authRepository: any,
		private readonly contactService: ContactService,
		private readonly accountService: AccountService
	) {}

	async register(registerData: IRegister) {
		let uid = '';
		const formattedPhoneNumber = formatPhoneToE164(registerData.phoneNumber);

		try {
			// Validate and format phone number before creating user

			// 1. Create Firebase user
			const newUser = await this.authRepository.createUser({
				email: registerData.email,
				password: registerData.password,
				firstName: registerData.firstName,
				lastName: registerData.lastName,
				phoneNumber: formattedPhoneNumber, // Already formatted by Zod
			});

			uid = newUser.uid;

			// 2. Create contact
			const contactData: Partial<IContact> = {
				firstName: registerData.firstName,
				lastName: registerData.lastName,
				email: registerData.email,
				phoneNumber: formattedPhoneNumber,
			};

			const contact = await this.contactService.create(contactData);
			if (!contact) {
				throw new Error('Contact creation failed');
			}

			// 3. Create account with initial ANONYMOUS role and permissions
			const initialRoles = [AccountRole.ANONYMOUS];
			const initialPermissions =
				PermissionHelper.getPermissionsForRoles(initialRoles);
			const contactId = contact.id;
			const account = await this.accountService.create({
				uid,
				contactId,
				roles: initialRoles,
				permissions: initialPermissions,
				isActive: true,
				lastLogin: new Date(),
				createdAt: new Date(),
				updatedAt: new Date(),
			});

			if (!account) {
				throw new Error('Account creation failed');
			}

			return {
				user: newUser,
				contact,
				roles: initialRoles,
				permissions: initialPermissions,
			};
		} catch (error) {
			// If any step fails, attempt to rollback created resources
			// This ensures we don't have orphaned records
			this.rollbackRegistration(uid, error);
			throw error;
		}
	}

	private async rollbackRegistration(uid: string, error: any) {
		if (!uid) {
			console.error('No UID provided for rollback');
			throw error;
		}

		try {
			// Add logging for debugging
			console.log('Starting rollback for UID:', uid);

			if (await this.accountService.getAccountByUid(uid)) {
				await this.accountService.delete(uid);
				console.log('Account deleted successfully');
			}

			if (await this.contactService.getById(uid)) {
				await this.contactService.delete(uid);
				console.log('Contact deleted successfully');
			}

			// Only attempt to delete Firebase user if UID exists
			await this.authRepository.deleteUser(uid);
			console.log('Firebase user deleted successfully');
		} catch (rollbackError) {
			console.error('Rollback failed:', {
				originalError: error,
				rollbackError,
				uid,
			});
		}

		// Rethrow with more context
		throw new _ERROR.InternalServerError({
			message: 'Registration failed',
			cause: error,
		});
	}

	async upgradeAnonymousToUser(uid: string) {
		const account = await this.accountService.getAccountByUid(uid);

		if (!account) {
			throw new Error('Account not found');
		}

		// Remove ANONYMOUS role and add USER role
		const newRoles = account.roles
			.filter((role) => role !== AccountRole.ANONYMOUS)
			.concat(AccountRole.USER);

		// Update permissions based on new roles
		const newPermissions = PermissionHelper.getPermissionsForRoles(newRoles);

		return this.accountService.update(account.id, {
			roles: newRoles,
			permissions: newPermissions,
			updatedAt: new Date(),
		});
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

	async logout(): Promise<boolean> {
		try {
			return await this.authRepository.logoutUser();
			// Additional cleanup if needed (e.g., clearing local storage, redirecting)
		} catch (error) {
			// Handle error
			throw error;
		}
	}

	async updateUserProfile(
		uid: string,
		profileData: IUserProfileUpdate
	): Promise<UserRecord> {
		try {
			return await this.authRepository.updateUserProfile(uid, profileData);
		} catch (error) {
			throw error;
		}
	}

	async deleteUser(uid: string): Promise<boolean> {
		try {
			return await this.authRepository.deleteUser(uid);
		} catch (error) {
			throw error;
		}
	}
}

export default AuthService;
