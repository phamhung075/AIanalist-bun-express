import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import _ERROR from '@/_core/helper/http-status/error';
import _SUCCESS from '@/_core/helper/http-status/success';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import { ISubscription } from './subscription.interface';
import SubscriptionService from './subscription.service';

@Service()
@BindMethods()
class SubscriptionController extends BaseController<ISubscription> {
	constructor(readonly subscriptionService: SubscriptionService) {
		super(subscriptionService);
	}

	async getMySubscriptions(
		req: CustomRequest,
		res: Response,
		_next: NextFunction
	) {
		try {
			if (!req.user?.uid) {
				throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
			}

			const subscriptions = await (
				this.service as SubscriptionService
			).getUserSubscriptions(req.user.uid);

			return new _SUCCESS.OkSuccess({
				message: 'Fetched user subscriptions successfully',
				data: subscriptions,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}

	async cancelSubscription(
		req: CustomRequest,
		res: Response,
		_next: NextFunction
	) {
		try {
			if (!req.user?.uid) {
				throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
			}

			const { id } = req.params;
			const { reason } = req.body;

			const subscription = await (
				this.service as SubscriptionService
			).cancelSubscription(id, reason);

			return new _SUCCESS.OkSuccess({
				message: 'Subscription cancelled successfully',
				data: subscription,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}
}

export default SubscriptionController;
