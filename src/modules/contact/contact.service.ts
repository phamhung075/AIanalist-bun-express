import Container, { Service } from 'typedi';
import { BaseService } from '../_base/crud/BaseService';
import { Contact } from './contact.interface';
import ContactRepository from './contact.repository';

@Service()
class ContactService extends BaseService<Contact> {
	constructor(private readonly repository: ContactRepository) {
		super(Contact);
	}

	baseRepository(): ContactRepository {
		return this.repository;
	}
}

export default ContactService;
