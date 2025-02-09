import { Service } from 'typedi';
import { BaseRepository } from '../_base/crud/BaseRepository';
import type { ISubscription } from './subscription.interface';

@Service()
class SubscriptionRepository extends BaseRepository<ISubscription> {
	constructor() {
		super('subscriptions');
	}

	async getUserSubscriptions(userId: string): Promise<ISubscription[]> {
		try {
			const querySnapshot = await this.collection
				.where('userId', '==', userId)
				.get();
			const userSubscriptions: ISubscription[] = [];
			querySnapshot.forEach((doc) => {
				const data = this.mapDocumentData(doc);
				userSubscriptions.push(data);
			});
			return userSubscriptions;
		} catch (error) {
			throw this.handleError(error, 'Failed to retrieve user subscriptions');
		}
	}
}

export default SubscriptionRepository;
