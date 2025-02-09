// index.ts
import { Container } from 'typedi';
import ProfileController from './profile.controller';
import ProfileRepository from './profile.repository';
import ProfileService from './profile.service';

const profileRepository = Container.get(ProfileRepository);
const profileService = Container.get(ProfileService);
const profileController = Container.get(ProfileController);

export { profileController, profileRepository, profileService };

export { default as ProfileController } from './profile.controller';
export { default as ProfileRepository } from './profile.repository';
export { default as ProfileService } from './profile.service';

export type { Profile } from './profile.interface';
