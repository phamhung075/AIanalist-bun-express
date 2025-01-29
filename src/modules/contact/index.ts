// src/modules/contact/contact.module.ts
import { Container } from 'typedi';
import { Service } from 'typedi';
import { ContactRepository } from './contact.repository';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';

@Service()
class ContactModule {
	constructor(
		public contactService: ContactService,
		public contactController: ContactController,
		public contactRepository: ContactRepository
	) {}
}

export const contactModule = Container.get(ContactModule);
export const contactService = Container.get(ContactService);
export const contactController = Container.get(ContactController);
export const contactRepository = Container.get(ContactRepository);
