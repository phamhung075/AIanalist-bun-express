import Container, { Service } from 'typedi';
import { BaseService } from '../_base/crud/BaseService';
import { Contact } from './contact.interface';
import { ContactRepository } from './contact.repository';

@Service()
export class ContactService extends BaseService<Contact> {
	contactRepository?: ContactRepository;
	constructor(private readonly repository: ContactRepository) {
		super(Contact);
	}

	baseRepository(): ContactRepository {
		return Container.get(ContactRepository);
	}
}
