import { Container } from 'typedi';
import ContactController from './contact.controller';
import ContactRepository from './contact.repository';
import ContactService from './contact.service';

Container.set(ContactRepository, new ContactRepository());
Container.set(
	ContactService,
	new ContactService(Container.get(ContactRepository))
);
Container.set(
	ContactController,
	new ContactController(Container.get(ContactService))
);

export const contactService = Container.get(ContactService);
export const contactController = Container.get(ContactController);
export const contactRepository = Container.get(ContactRepository);
