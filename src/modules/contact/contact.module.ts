// src/modules/contact/contact.module.ts
import { Container } from 'typedi';
import ContactController from './contact.controller';
import ContactRepository from './contact.repository';
import ContactService from './contact.service';


class ContactModule {
    private static instance: ContactModule;
    public contactController: ContactController;
    public contactService: ContactService;
    public contactRepository: ContactRepository;

    private constructor() {
        // First create repository
        this.contactRepository = new ContactRepository();
        Container.set('ContactRepository', this.contactRepository);

        // Then create service with repository
        this.contactService = new ContactService(this.contactRepository);
        Container.set('ContactService', this.contactService);

        // Finally create controller with service
        this.contactController = new ContactController(this.contactService);
        Container.set('ContactController', this.contactController);
    }

    public static getInstance(): ContactModule {
        if (!ContactModule.instance) {
            ContactModule.instance = new ContactModule();
        }
        return ContactModule.instance;
    }
}

const contactModule = ContactModule.getInstance();
export const { contactController, contactService, contactRepository } = contactModule;