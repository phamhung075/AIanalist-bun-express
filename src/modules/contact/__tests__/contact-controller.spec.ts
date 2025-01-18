import { Request, Response, NextFunction } from 'express';
import ContactController from '../contact.controller';
import ContactService from '../contact.service';
import { HttpStatusCode } from '@/_core/helper/http-status/common/HttpStatusCode';
import { RestHandler } from '@/_core/helper/http-status/common/RestHandler';
import { IContact } from '../contact.interface';
import ContactRepository from '../contact.repository';

jest.mock('../contact.service');
jest.mock('@/_core/helper/http-status/common/RestHandler');

describe('ContactController', () => {
  let contactController: ContactController;
  let mockContactService: jest.Mocked<ContactService>;
  let mockContactRepository: jest.Mocked<ContactRepository>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockContactRepository = new ContactRepository() as jest.Mocked<ContactRepository>;
    mockContactService = new ContactService(mockContactRepository) as jest.Mocked<ContactService>;
    contactController = new ContactController(mockContactService);

    req = {
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // ✅ Test create
  it('should create a new contact', async () => {
    req.body = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test message',
    };

    const mockContact: IContact = {
      id: '1',
      ...req.body,
    };

    mockContactService.create.mockResolvedValue(mockContact);

    await contactController.create(req as any, res as Response, next);

    expect(mockContactService.create).toHaveBeenCalledWith(req.body);
    expect(RestHandler.success).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.CREATED,
      message: 'Contact created successfully',
      data: mockContact,
    });
  });

  it('should handle failure to create a contact', async () => {
    req.body = {
      name: 'Invalid Contact',
    };

    mockContactService.create(req.body);

    await contactController.create(req as any, res as Response, next);

    expect(mockContactService.create).toHaveBeenCalledWith(req.body);
    expect(RestHandler.error).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.BAD_REQUEST,
      message: 'Contact creation failed',
    });
  });

  // ✅ Test getAll
  it('should return all contacts', async () => {
    const mockContacts: IContact[] = [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '1234567890', message: 'Test message' },
    ];

    mockContactService.getAll.mockResolvedValue(mockContacts);

    await contactController.getAll(req as any, res as Response, next);

    expect(mockContactService.getAll).toHaveBeenCalled();
    expect(RestHandler.success).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.OK,
      message: 'Get all contacts successfully',
      data: mockContacts,
    });
  });

  it('should handle no contacts found', async () => {
    mockContactService.getAll.mockResolvedValue([]);

    await contactController.getAll(req as any, res as Response, next);

    expect(RestHandler.success).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.NO_CONTENT,
      message: 'Get all contacts successfully',
      data: [],
    });
  });

  // ✅ Test getById
  it('should return a contact by ID', async () => {
    if (req.params === undefined) {
      throw new Error('Missing required parameter: id');
    }
    req.params.id = '1';

    const mockContact: IContact = {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test message',
    };

    mockContactService.getById.mockResolvedValue(mockContact);

    await contactController.getById(req as any, res as Response, next);

    expect(mockContactService.getById).toHaveBeenCalledWith('1');
    expect(RestHandler.success).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.OK,
      message: 'Get contact by id successfully',
      data: mockContact,
    });
  });

  it('should return 404 when contact is not found', async () => {
    if (req.params === undefined) {
      throw new Error('Missing required parameter: id');
    }
    req.params.id = '1';

    mockContactService.getById.mockResolvedValue(null);

    await contactController.getById(req as any, res as Response, next);

    expect(mockContactService.getById).toHaveBeenCalledWith('1');
    expect(RestHandler.error).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.NOT_FOUND,
      message: 'Contact not found',
    });
  });

  // ✅ Test update
  it('should update a contact successfully', async () => {
     if (req.params === undefined) {
      throw new Error('Missing required parameter: id');
    }
    req.params.id = '1';
    req.body = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '9876543210',
      message: 'Updated message',
    };

    const updatedContact: IContact = {
      id: '1',
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
      phone: '9876543210',
      message: 'Updated message',
    };

    mockContactService.update.mockResolvedValue(updatedContact);

    await contactController.update(req as any, res as Response, next);

    expect(mockContactService.update).toHaveBeenCalledWith('1', req.body);
    expect(RestHandler.success).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.OK,
      message: 'Update contact successfully',
      data: updatedContact,
    });
  });

  it('should return 404 when contact is not found', async () => {
     if (req.params === undefined) {
      throw new Error('Missing required parameter: id');
    }
    req.params.id = '1';
    req.body = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
      phone: '9876543210',
      message: 'Updated message',
    };

    mockContactService.update.mockResolvedValue(null);

    await contactController.update(req as any, res as Response, next);

    expect(mockContactService.update).toHaveBeenCalledWith('1', req.body);
    expect(RestHandler.error).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.NOT_FOUND,
      message: 'Contact not found',
    });
  });

  // ✅ Test delete
  it('should delete a contact', async () => {
    if (req.params === undefined) {
      throw new Error('Missing required parameter: id');
    }
    req.params.id = '1';

    mockContactService.delete.mockResolvedValue(true);

    await contactController.delete(req as any, res as Response, next);

    expect(mockContactService.delete).toHaveBeenCalledWith('1');
    expect(RestHandler.success).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.OK,
      message: 'Delete contact successfully',
    });
  });

  it('should handle delete failure', async () => {
    if (req.params === undefined) {
      throw new Error('Missing required parameter: id');
    }
    req.params.id = '1';

    mockContactService.delete.mockResolvedValue(false);

    await contactController.delete(req as any, res as Response, next);

    expect(mockContactService.delete).toHaveBeenCalledWith('1');
    expect(RestHandler.error).toHaveBeenCalledWith(req, res, {
      code: HttpStatusCode.NOT_FOUND,
      message: 'Contact not found',
    });
  });
});
