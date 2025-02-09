import { Service } from 'typedi';
import { BaseService } from '../_base/crud/BaseService';
import { ISubscription } from './subscription.interface';
import SubscriptionRepository from './subscription.repository';

@Service()
class SubscriptionService extends BaseService<ISubscription> {
	constructor(readonly repository: SubscriptionRepository) {
		super(repository);
	}

	async cancelSubscription(
		id: string,
		reason?: string
	): Promise<ISubscription> {
		const subscription = await this.getById(id);
		if (!subscription) {
			throw new Error('Subscription not found');
		}

		const updatedSubscription = await this.update(id, {
			status: 'cancelled',
			cancelReason: reason,
			autoRenew: false,
		});

		if (!updatedSubscription) {
			throw new Error('Failed to cancel subscription');
		}

		return updatedSubscription;
	}

	async getUserSubscriptions(userId: string): Promise<ISubscription[]> {
		return this.repository.getUserSubscriptions(userId);
	}
}

export default SubscriptionService;
