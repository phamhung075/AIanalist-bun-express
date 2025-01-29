import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import Container, { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import { Contact } from './contact.interface';
import ContactService from './contact.service';

@Service()
@BindMethods()
class ContactController extends BaseController<Contact> {
	constructor(readonly contactService: ContactService) {
		super(contactService);
	}
}

export default ContactController;
