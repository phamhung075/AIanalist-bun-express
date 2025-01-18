import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import type { CreateInput, UpdateInput } from './contact.dto';
import type { IContact } from './contact.interface';
import type ContactService from './contact.service';
import { BindMethods } from '@/_core/decorators/bind-methods.decorator';


@Service()
@BindMethods()
class ContactController extends BaseController<IContact, CreateInput, UpdateInput> {
    constructor(
        protected readonly contactService: ContactService
    ) {
        super(contactService);
    }
}

export default ContactController;
