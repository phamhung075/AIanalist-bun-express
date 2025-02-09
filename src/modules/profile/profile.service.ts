// profile.service.ts
import { Service } from 'typedi';
import { Profile, UpdatePasswordDTO } from './profile.interface';
import ProfileRepository from './profile.repository';
import { BindMethods } from '@/_core/decorators/bind-methods.decorator';

@Service()
@BindMethods()
class ProfileService {
	constructor(private readonly profileRepository: ProfileRepository) {}

	async updateProfile(
		userId: string,
		profile: Partial<Profile>
	): Promise<Profile> {
		return this.profileRepository.updateProfile(userId, profile);
	}

	async updatePassword(userId: string, data: UpdatePasswordDTO): Promise<void> {
		return this.profileRepository.updatePassword(userId, data);
	}

	async linkGoogleAccount(userId: string): Promise<void> {
		return this.profileRepository.linkGoogleAccount(userId);
	}

	async unlinkProvider(userId: string, providerId: string): Promise<void> {
		return this.profileRepository.unlinkProvider(userId, providerId);
	}

	async toggleNotification(userId: string): Promise<boolean> {
		return this.profileRepository.toggleNotification(userId);
	}
}

export default ProfileService;
