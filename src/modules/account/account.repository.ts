import { Service } from 'typedi';
import { BaseRepository } from '../_base/crud/BaseRepository';
import { IAccount } from './account.interface';

@Service()
class AccountRepository extends BaseRepository<IAccount> {
	constructor() {
		super('accounts');
	}

	async findByUid(uid: string): Promise<IAccount | null> {
		return this.findOneByField('uid', uid);
	}

	async findByEmail(email: string): Promise<IAccount | null> {
		return this.findOneByField('email', email);
	}

	async findByContactId(contactId: string): Promise<IAccount | null> {
		return this.findOneByField('contactId', contactId);
	}

	async findBySubscriptionId(
		subscriptionId: string[]
	): Promise<IAccount | null> {
		return this.findOneByField('subscriptionIds', subscriptionId);
	}
}

export default AccountRepository;
