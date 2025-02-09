import _ERROR from '@/_core/helper/http-status/error';
import { AccountPermission } from '@/modules/account/account.interface';
import AccountService from '@/modules/account/account.service';
import { NextFunction, Response } from 'express';
import { Container } from 'typedi';
import { CustomRequest } from '../helper/interfaces/CustomRequest.interface';

export const requirePermission = (permission: AccountPermission) => {
	return async (req: CustomRequest, _res: Response, next: NextFunction) => {
		try {
			const accountService = Container.get(AccountService);
			const uid = req.user?.uid;

			if (!uid) {
				throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
			}

			const account = await accountService.getAccountByUid(uid);
			if (!account) {
				throw new _ERROR.UnauthorizedError({ message: 'Account not found' });
			}

			const hasPermission = await accountService.checkPermission(
				account.id,
				permission
			);
			if (!hasPermission) {
				throw new _ERROR.ForbiddenError({
					message: 'Insufficient permissions',
				});
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};
