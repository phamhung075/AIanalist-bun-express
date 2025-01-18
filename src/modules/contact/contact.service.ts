import Container, { Service } from 'typedi';
import { BaseService } from '../_base/crud/BaseService';
import { Contact } from './contact.interface';
import ContactRepository from './contact.repository';

@Service()
class ContactService extends BaseService<Contact> {
	constructor(readonly repository: ContactRepository) {
		super(repository);
	}
}

export default ContactService;
