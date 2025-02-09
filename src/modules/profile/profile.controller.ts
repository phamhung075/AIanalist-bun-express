// profile.controller.ts
import { RequestHandler } from 'express';
import { Service } from 'typedi';

import ProfileService from './profile.service';
import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import _ERROR from '@/_core/helper/http-status/error';
import _SUCCESS from '@/_core/helper/http-status/success';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { UpdatePasswordDTO } from './profile.interface';

@Service()
@BindMethods()
class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

	updateProfile: RequestHandler = async (req: CustomRequest, res) => {
		if (!req.user?.uid)
			throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
		const result = await this.profileService.updateProfile(
			req.user.uid,
			req.body
		);
		new _SUCCESS.OkSuccess({
			message: 'Profile updated successfully',
			data: result,
		}).send(res);
	};

	updatePassword: RequestHandler = async (req: CustomRequest, res) => {
		if (!req.user?.uid)
			throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
		await this.profileService.updatePassword(
			req.user.uid,
			req.body as UpdatePasswordDTO
		);
		new _SUCCESS.OkSuccess({
			message: 'Password updated successfully',
		}).send(res);
	};

	linkGoogleAccount: RequestHandler = async (req: CustomRequest, res) => {
		if (!req.user?.uid)
			throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
		await this.profileService.linkGoogleAccount(req.user.uid);
		new _SUCCESS.OkSuccess({
			message: 'Google account linked successfully',
		}).send(res);
	};

	unlinkProvider: RequestHandler = async (req: CustomRequest, res) => {
		if (!req.user?.uid)
			throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
		await this.profileService.unlinkProvider(
			req.user.uid,
			req.params.providerId
		);
		new _SUCCESS.OkSuccess({
			message: 'Provider unlinked successfully',
		}).send(res);
	};

	toggleNotification: RequestHandler = async (req: CustomRequest, res) => {
		if (!req.user?.uid)
			throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
		const result = await this.profileService.toggleNotification(req.user.uid);
		new _SUCCESS.OkSuccess({
			message: 'Notification state updated successfully',
			data: result,
		}).send(res);
	};
}

export default ProfileController;
