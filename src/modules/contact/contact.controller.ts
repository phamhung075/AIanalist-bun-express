import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import Container, { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import { Contact } from './contact.interface';
import ContactService from './contact.service';

@Service()
@BindMethods()
class ContactController extends BaseController<Contact> {
	constructor(private readonly contactService: ContactService) {
		super(Contact);
	}

	baseService(): ContactService {
		return this.contactService;
	}
}

export default ContactController;
