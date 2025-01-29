import { Container } from 'typedi';
import ContactController from './contact.controller';
import ContactRepository from './contact.repository';
import ContactService from './contact.service';

// Créer des instances avec une injection de dépendance appropriée
const contactRepository = new ContactRepository();
Container.set(ContactRepository, contactRepository);

const contactService = new ContactService(contactRepository);
Container.set(ContactService, contactService);

const contactController = new ContactController(contactService);
Container.set(ContactController, contactController);

// Exporter les instances
export { contactService, contactController, contactRepository };
// Also export the types/classes for type usage
export { default as ContactController } from './contact.controller';
export { default as ContactRepository } from './contact.repository';
export { default as ContactService } from './contact.service';
export type { Contact, IContact } from './contact.interface';
