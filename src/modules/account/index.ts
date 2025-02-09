import { Container } from 'typedi';
import AccountController from './account.controller';
import AccountRepository from './account.repository';
import AccountService from './account.service';

const accountController = Container.get(AccountController);
const accountService = Container.get(AccountService);
const accountRepository = Container.get(AccountRepository);

// Export instances
export { accountController, accountService, accountRepository };

// Export types/classes
export { default as AccountController } from './account.controller';
export { default as AccountRepository } from './account.repository';
export { default as AccountService } from './account.service';
export {
	AccountPermission,
	AccountRole,
	type IAccount,
} from './account.interface';
export { PermissionHelper } from './permission.helper';
export { requirePermission } from '../../_core/middleware/permission.middleware';
