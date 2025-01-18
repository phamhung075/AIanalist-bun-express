import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController.js';
import type { CreateInput, UpdateInput } from './contact.dto.js';
import type { IContact } from './contact.interface.js';
import type ContactService from './contact.service.js';


@Service('ContactController')
class ContactController extends BaseController<IContact, CreateInput, UpdateInput> {
    constructor(private readonly contactService: ContactService) {
        super(contactService);
    }
}

export default ContactController;
