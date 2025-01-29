// contact.repository.ts
import { Service } from 'typedi';
import { BaseRepository } from '../_base/crud/BaseRepository';
import type { Contact } from './contact.interface';

@Service()
export class ContactRepository extends BaseRepository<Contact> {
	constructor() {
		super('contacts');
	}
}
