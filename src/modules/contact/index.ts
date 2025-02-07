import { Container } from 'typedi';
import ContactController from './contact.controller';
import ContactRepository from './contact.repository';
import ContactService from './contact.service';

const contactController = Container.get(ContactController);
const contactService = Container.get(ContactService);
const contactRepository = Container.get(ContactRepository);

// Export instances
export { contactController, contactService, contactRepository };
// Also export the types/classes for type usage
export { default as ContactController } from './contact.controller';
export { default as ContactRepository } from './contact.repository';
export { default as ContactService } from './contact.service';
export type { Contact, IContact } from './contact.interface';
