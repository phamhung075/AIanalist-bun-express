// contact.repository.ts
import { Service } from 'typedi';
import { BaseRepository } from '../_base/crud/BaseRepository.js';
import type { IContact } from './contact.interface.js';

@Service('ContactRepository')
class ContactRepository extends BaseRepository<IContact> {
    constructor() {
        super('contacts');
    }
}

export default ContactRepository;
