// contact.service.ts

import { Service } from 'typedi';
import { BaseService } from "../_base/crud/BaseService";
import type { IContact } from "./contact.interface";
import type ContactRepository from "./contact.repository";


@Service('ContactService')
class ContactService extends BaseService<IContact> {
    constructor(private readonly contactRepository: ContactRepository) {
        super(contactRepository);
    }
}

export default ContactService;