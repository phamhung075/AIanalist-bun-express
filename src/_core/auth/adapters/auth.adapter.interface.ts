import { DecodedIdToken, UserRecord } from 'firebase-admin/auth';
import { IAuth, IUserProfileUpdate } from '../auth.interface';

export interface IAuthAdapter {
	createUser(account: IAuth): Promise<UserRecord>;
	loginUser(
		email: string,
		password: string
	): Promise<{ idToken: string; refreshToken: string }>;
	verifyIdToken(token: string): Promise<DecodedIdToken>;
	getUserById(uid: string): Promise<UserRecord>;
	refreshToken(
		refreshToken: string
	): Promise<{ idToken: string; refreshToken: string }>;
	logoutUser(): Promise<boolean>;
	updateUserProfile(
		uid: string,
		profileData: IUserProfileUpdate
	): Promise<UserRecord>;
	deleteUser(uid: string): Promise<boolean>;
}
