// contact.service.ts

import { Service } from 'typedi';
import { BaseService } from "../_base/crud/BaseService.js";
import type { IContact } from "./contact.interface.js";
import type ContactRepository from "./contact.repository.js";


@Service('ContactService')
class ContactService extends BaseService<IContact> {
    constructor(private readonly contactRepository: ContactRepository) {
        super(contactRepository);
    }
}

export default ContactService;