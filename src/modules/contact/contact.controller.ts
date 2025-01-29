import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import Container, { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import { BaseService } from '../_base/crud/BaseService';
import { Contact } from './contact.interface';
import { ContactService } from './contact.service';

@Service()
@BindMethods()
export class ContactController extends BaseController<Contact> {
	constructor() {
		super(Contact);
	}

	baseService(): ContactService {
		return Container.get(ContactService);
	}
}
