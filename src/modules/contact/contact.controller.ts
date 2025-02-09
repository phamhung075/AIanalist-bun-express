import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import _ERROR from '@/_core/helper/http-status/error';
import _SUCCESS from '@/_core/helper/http-status/success';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import { IContact } from './contact.interface';
import ContactService from './contact.service';

@Service()
@BindMethods()
class ContactController extends BaseController<IContact> {
	constructor(readonly contactService: ContactService) {
		super(contactService);
	}

	async getMyContact(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			console.log(req.user);
			if (!req.user?.uid) {
				throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
			}

			const result = req.user;
			const uid = req.user.uid as string;
			const entity = await this.service.getById(uid);

			if (!entity) {
				throw new _ERROR.NotFoundError({
					message: 'Entity not found',
				});
			}

			return new _SUCCESS.OkSuccess({
				message: 'Fetched entity by ID successfully',
				data: entity,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}
}

export default ContactController;
