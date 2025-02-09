import { Service } from 'typedi';
import { BaseService } from '../_base/crud/BaseService';
import { IAccount, AccountRole, AccountPermission } from './account.interface';
import AccountRepository from './account.repository';
import { ContactService } from '../contact';
import { SubscriptionService } from '../subscription';
import { PermissionHelper } from './permission.helper';
import _ERROR from '@/_core/helper/http-status/error';

@Service()
class AccountService extends BaseService<IAccount> {
	constructor(
		readonly repository: AccountRepository,
		private readonly contactService: ContactService,
		private readonly subscriptionService: SubscriptionService
	) {
		super(repository);
	}

	async createAccount(data: Partial<IAccount>): Promise<IAccount> {
		// Ensure default role and permissions
		const roles = data.roles || [AccountRole.USER];
		const permissions =
			data.permissions || PermissionHelper.getPermissionsForRoles(roles);

		const account = (await this.create({
			...data,
			roles,
			permissions,
			isActive: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		})) as IAccount;

		return account;
	}

	async getAccountByUid(uid: string): Promise<IAccount | null> {
		return (this.repository as AccountRepository).findByUid(uid);
	}

	async addSubscription(
		accountId: string,
		subscriptionId: string
	): Promise<IAccount> {
		const account = await this.getById(accountId);
		if (!account) {
			throw new _ERROR.NotFoundError({ message: 'Account not found' });
		}

		const subscription = await this.subscriptionService.getById(subscriptionId);
		if (!subscription) {
			throw new _ERROR.NotFoundError({ message: 'Subscription not found' });
		}

		const updatedSubscriptionIds = [
			...(account.subscriptionIds || []),
			subscriptionId,
		];

		const result = await this.update(accountId, {
			subscriptionIds: updatedSubscriptionIds,
		});

		if (!result) {
			throw new _ERROR.InternalServerError({
				message: 'Échec de la mise à jour du compte',
			});
		}

		return result;
	}

	async linkContact(accountId: string, contactId: string): Promise<IAccount> {
		const account = await this.getById(accountId);
		if (!account) {
			throw new _ERROR.NotFoundError({ message: 'Account not found' });
		}

		const contact = await this.contactService.getById(contactId);
		if (!contact) {
			throw new _ERROR.NotFoundError({ message: 'Contact non trouvé' });
		}

		const result = await this.update(accountId, { contactId });
		if (!result) {
			throw new _ERROR.InternalServerError({
				message: 'Échec de la mise à jour du contact',
			});
		}

		return result;
	}

	async updateRoles(
		accountId: string,
		roles: AccountRole[]
	): Promise<IAccount> {
		const account = await this.getById(accountId);
		if (!account) {
			throw new _ERROR.NotFoundError({ message: 'Compte non trouvé' });
		}

		// Mettre à jour les permissions en fonction des nouveaux rôles
		const permissions = PermissionHelper.getPermissionsForRoles(roles);
		const result = await this.update(accountId, { roles, permissions });

		if (!result) {
			throw new _ERROR.InternalServerError({
				message: 'Échec de la mise à jour des rôles',
			});
		}

		return result;
	}

	async checkPermission(
		accountId: string,
		permission: AccountPermission
	): Promise<boolean> {
		const account = await this.getById(accountId);
		if (!account) {
			return false;
		}

		return PermissionHelper.hasPermission(account.permissions, permission);
	}
}

export default AccountService;
