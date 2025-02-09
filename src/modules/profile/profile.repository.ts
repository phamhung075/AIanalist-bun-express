// profile.repository.ts
import Container, { Service } from 'typedi';
import {
	EmailAuthProvider,
	GoogleAuthProvider,
	linkWithPopup,
	reauthenticateWithCredential,
	unlink,
	updatePassword,
	getAuth as getClientAuth,
} from 'firebase/auth';
import {
	Firestore,
	doc,
	updateDoc,
	getDoc,
	getFirestore,
} from 'firebase/firestore';
import { Profile, UpdatePasswordDTO } from './profile.interface';
import { firebaseAdminAuth } from '@/_core/database/firebase-admin-sdk';
import _ERROR from '@/_core/helper/http-status/error';
import { AuthService } from '@/_core/auth';

@Service()
class ProfileRepository {
	private adminAuth;
	private clientAuth;
	private authService: AuthService;
	private firestore: Firestore;

	constructor() {
		this.adminAuth = firebaseAdminAuth;
		this.clientAuth = getClientAuth();
		this.firestore = getFirestore();
		this.authService = Container.get(AuthService);
	}

	async getProfile(userId: string): Promise<Profile> {
		try {
			const userRecord = await this.authService.getUser(userId);
			const userDocRef = doc(this.firestore, `users/${userId}`);
			const userDocSnap = await getDoc(userDocRef);

			if (!userDocSnap.exists()) {
				throw new _ERROR.NotFoundError({
					message: 'User document not found',
				});
			}

			const data = userDocSnap.data();

			// Fusionner les données Firestore avec les données Auth
			return {
				...data,
				email: userRecord.email || data.email,
				firstname: data.firstname || '',
				lastname: data.lastname || '',
				notification: data.notification || false,
				linkedAccounts: userRecord.providerData
					.map((p: any) => p.email)
					.filter(Boolean) as string[],
				authProvider: userRecord.providerData[0]?.providerId || 'unknown',
			};
		} catch (error: any) {
			console.error('Erreur lors de la récupération du profil:', error);
			if (error instanceof _ERROR.NotFoundError) {
				throw error;
			}
			throw new _ERROR.InternalServerError({
				message: 'Échec de la récupération du profil',
			});
		}
	}

	async updateProfile(
		userId: string,
		profile: Partial<Profile>
	): Promise<Profile> {
		try {
			const userDoc = doc(this.firestore, `users/${userId}`);
			await updateDoc(userDoc, profile);
			return profile as Profile;
		} catch (error: any) {
			console.error('Update profile error:', error);
			throw new _ERROR.InternalServerError({
				message: 'Failed to update profile',
			});
		}
	}

	async updatePassword(userId: string, data: UpdatePasswordDTO): Promise<void> {
		try {
			const user = this.clientAuth.currentUser;
			if (!user || !user.email) {
				throw new _ERROR.UnauthorizedError({
					message: 'No authenticated user',
				});
			}

			const credential = EmailAuthProvider.credential(
				user.email,
				data.currentPassword
			);
			await reauthenticateWithCredential(user, credential);
			await updatePassword(user, data.newPassword);
		} catch (error: any) {
			console.error('Update password error:', error);
			throw new _ERROR.UnauthorizedError({
				message: 'Failed to update password',
			});
		}
	}

	async linkGoogleAccount(userId: string): Promise<void> {
		try {
			const user = this.clientAuth.currentUser;
			if (!user) {
				throw new _ERROR.UnauthorizedError({
					message: 'No authenticated user',
				});
			}

			const provider = new GoogleAuthProvider();
			await linkWithPopup(user, provider);

			// Update linked accounts in Firestore
			if (user.email) {
				const userDoc = doc(this.firestore, `users/${userId}`);
				const linkedAccounts = user.providerData
					.map((p) => p.email)
					.filter(Boolean) as string[];

				await updateDoc(userDoc, { linkedAccounts });
			}
		} catch (error: any) {
			console.error('Link Google account error:', error);
			throw new _ERROR.InternalServerError({
				message: 'Failed to link Google account',
			});
		}
	}

	async unlinkProvider(userId: string, providerId: string): Promise<void> {
		try {
			const user = this.clientAuth.currentUser;
			if (!user) {
				throw new _ERROR.UnauthorizedError({
					message: 'No authenticated user',
				});
			}

			await unlink(user, providerId);

			// Update linked accounts in Firestore
			const userDoc = doc(this.firestore, `users/${userId}`);
			const linkedAccounts = user.providerData
				.map((p) => p.email)
				.filter(Boolean) as string[];

			await updateDoc(userDoc, { linkedAccounts });
		} catch (error: any) {
			console.error('Unlink provider error:', error);
			throw new _ERROR.InternalServerError({
				message: 'Failed to unlink provider',
			});
		}
	}

	async toggleNotification(userId: string): Promise<boolean> {
		try {
			const userDoc = doc(this.firestore, `users/${userId}`);
			const snapshot = await getDoc(userDoc);

			if (!snapshot.exists()) {
				throw new _ERROR.NotFoundError({
					message: 'User profile not found',
				});
			}

			const currentState = snapshot.data()?.notification || false;
			const newState = !currentState;

			await updateDoc(userDoc, { notification: newState });
			return newState;
		} catch (error: any) {
			console.error('Toggle notification error:', error);
			throw new _ERROR.InternalServerError({
				message: 'Failed to toggle notification',
			});
		}
	}
}

export default ProfileRepository;
