// contact.service.ts

import { Service } from 'typedi';
import { BaseService } from "../_base/crud/BaseService";
import type { IContact } from "./contact.interface";
import type ContactRepository from "./contact.repository";


@Service()
class ContactService extends BaseService<IContact> {
    constructor(
        protected readonly repository: ContactRepository
    ) {
        super(repository);
    }
}

export default ContactService;