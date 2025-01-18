// __tests__/contact.service.spec.ts
import ContactService from '../contact.service';
import ContactRepository from '../contact.repository';

describe('ContactService', () => {
  let contactService: ContactService;
  let mockContactRepository: jest.Mocked<ContactRepository>;

  beforeEach(() => {
    mockContactRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    contactService = new ContactService(mockContactRepository);
    jest.clearAllMocks();
  });

  it('should create a new contact', async () => {
    const contactData = { name: 'John', email: 'john@example.com', phone: '1234567890' };
    mockContactRepository.create.mockResolvedValue({ id: '1', ...contactData });

    const result = await contactService.createContact(contactData);

    expect(mockContactRepository.create).toHaveBeenCalledWith(contactData);
    expect(result).toEqual({ id: '1', ...contactData });
  });

  it('should fetch all contacts', async () => {
    const contacts = [{ id: '1', name: 'John', email: 'john@example.com', phone: '1234567890' }];
    mockContactRepository.findAll.mockResolvedValue(contacts);

    const result = await contactService.getAllContacts();

    expect(mockContactRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(contacts);
  });

  it('should fetch a contact by ID', async () => {
    const contact = { id: '1', name: 'John', email: 'john@example.com', phone: '1234567890' };
    mockContactRepository.findById.mockResolvedValue(contact);

    const result = await contactService.getContactById('1');

    expect(mockContactRepository.findById).toHaveBeenCalledWith('1');
    expect(result).toEqual(contact);
  });

  it('should update a contact by ID', async () => {
    const updatedContact = { id: '1', name: 'John Updated', email: 'john@example.com', phone: '1234567890' };
    mockContactRepository.update.mockResolvedValue(updatedContact);

    const result = await contactService.updateContact('1', updatedContact);

    expect(mockContactRepository.update).toHaveBeenCalledWith('1', updatedContact);
    expect(result).toEqual(updatedContact);
  });

  it('should delete a contact by ID', async () => {
    mockContactRepository.delete.mockResolvedValue(true);

    const result = await contactService.deleteContact('1');

    expect(mockContactRepository.delete).toHaveBeenCalledWith('1');
    expect(result).toBe(true);
  });
});
