import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import _ERROR from '@/_core/helper/http-status/error';
import _SUCCESS from '@/_core/helper/http-status/success';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import { IAccount, AccountRole } from './account.interface';
import AccountService from './account.service';

@Service()
@BindMethods()
class AccountController extends BaseController<IAccount> {
	constructor(readonly accountService: AccountService) {
		super(accountService);
	}

	async getMyAccount(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			if (!req.user?.uid) {
				throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
			}

			const account = await (this.service as AccountService).getAccountByUid(
				req.user.uid
			);
			if (!account) {
				throw new _ERROR.NotFoundError({ message: 'Account not found' });
			}

			return new _SUCCESS.OkSuccess({
				message: 'Fetched account successfully',
				data: account,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}

	async updateRoles(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			const { id } = req.params;
			const { roles } = req.body;

			if (
				!Array.isArray(roles) ||
				!roles.every((role) => Object.values(AccountRole).includes(role))
			) {
				throw new _ERROR.BadRequestError({ message: 'Invalid roles provided' });
			}

			const account = await (this.service as AccountService).updateRoles(
				id,
				roles
			);

			return new _SUCCESS.OkSuccess({
				message: 'Updated account roles successfully',
				data: account,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}

	async linkContact(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			const { id } = req.params;
			const { contactId } = req.body;

			const account = await (this.service as AccountService).linkContact(
				id,
				contactId
			);

			return new _SUCCESS.OkSuccess({
				message: 'Linked contact successfully',
				data: account,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}

	async addSubscription(
		req: CustomRequest,
		res: Response,
		_next: NextFunction
	) {
		try {
			const { id } = req.params;
			const { subscriptionId } = req.body;

			const account = await (this.service as AccountService).addSubscription(
				id,
				subscriptionId
			);

			return new _SUCCESS.OkSuccess({
				message: 'Added subscription successfully',
				data: account,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}
}

export default AccountController;
