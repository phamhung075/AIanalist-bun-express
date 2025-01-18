import ContactRepository from '../contact.repository';
import { IContact } from '../contact.interface';
import { firestore } from '@/_core/database/firebase-admin-sdk';

// ✅ Proper Firestore Mocking
jest.mock('@/_core/database/firebase', () => ({
  firestore: {
    collection: jest.fn(() => ({
      add: jest.fn(),
      get: jest.fn(),
      doc: jest.fn(() => ({
        get: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      })),
    })),
  },
}));

// ✅ TypeScript Type for Mocked Firestore
const mockFirestore = firestore as unknown as {
  collection: jest.Mock<
    {
      add: jest.Mock;
      get: jest.Mock;
      doc: jest.Mock<{
        get: jest.Mock;
        update: jest.Mock;
        delete: jest.Mock;
      }>;
    },
    [string]
  >;
};

describe('ContactRepository', () => {
  let contactRepository: ContactRepository;

  beforeEach(() => {
    contactRepository = new ContactRepository();
    jest.clearAllMocks();
  });

  // ✅ Test: Create a New Contact
  it('should create a new contact', async () => {
    const contactData: IContact = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test message',
    };

    mockFirestore.collection.mockReturnValue({
      add: jest.fn().mockResolvedValue({ id: '123' }),
      get: jest.fn(),
      doc: jest.fn(),
    });

    const result = await contactRepository.create(contactData);

    expect(mockFirestore.collection).toHaveBeenCalledWith('contacts');
    expect(mockFirestore.collection('contact').add).toHaveBeenCalledWith({
      ...contactData,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(result).toEqual({ id: '123', ...contactData });
  });

  // ✅ Test: Find All Contacts
  it('should fetch all contacts', async () => {
    const mockSnapshot = {
      docs: [
        {
          id: '1',
          data: () => ({
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '1234567890',
            message: 'Hello',
          }),
        },
      ],
    };

    mockFirestore.collection.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockSnapshot),
      add: jest.fn(),
      doc: jest.fn(),
    });

    const result = await contactRepository.findAll();

    expect(mockFirestore.collection).toHaveBeenCalledWith('contacts');
    expect(mockFirestore.collection('contact').get).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567890',
        message: 'Hello',
      },
    ]);
  });

  // ✅ Test: Find Contact by ID
  it('should fetch a contact by ID', async () => {
    const mockDoc = {
      exists: true,
      id: '1',
      data: () => ({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567890',
        message: 'Hello',
      }),
    };

    mockFirestore.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockDoc),
      }),
      add: jest.fn(),
      get: jest.fn(),
    });

    const result = await contactRepository.findById('1');

    expect(mockFirestore.collection).toHaveBeenCalledWith('contacts');
    expect(mockFirestore.collection('contact').doc).toHaveBeenCalledWith('1');
    expect(mockFirestore.collection('contact').doc().get).toHaveBeenCalled();
    expect(result).toEqual({
      id: '1',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '1234567890',
      message: 'Hello',
    });
  });

  // ✅ Test: Update Contact by ID
  it('should update a contact by ID', async () => {
    const updatedData = {
      name: 'Jane Doe Updated',
      email: 'jane@example.com',
      phone: '1234567890',
      message: 'Updated message',
    };

    mockFirestore.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        update: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: '1',
          data: () => updatedData,
        }),
      }),
      add: jest.fn(),
      get: jest.fn(),
    });

    const result = await contactRepository.update('1', updatedData);

    expect(mockFirestore.collection).toHaveBeenCalledWith('contacts');
    expect(mockFirestore.collection('contact').doc).toHaveBeenCalledWith('1');
    expect(mockFirestore.collection('contact').doc().update).toHaveBeenCalledWith({
      ...updatedData,
      updatedAt: expect.any(Date),
    });
    expect(result).toEqual({
      id: '1',
      ...updatedData,
    });
  });

  // ✅ Test: Delete Contact by ID
  it('should delete a contact by ID', async () => {
    mockFirestore.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        delete: jest.fn().mockResolvedValue(undefined),
      }),
      add: jest.fn(),
      get: jest.fn(),
    });

    const result = await contactRepository.delete('1');

    expect(mockFirestore.collection).toHaveBeenCalledWith('contacts');
    expect(mockFirestore.collection('contact').doc).toHaveBeenCalledWith('1');
    expect(mockFirestore.collection('contact').doc().delete).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
