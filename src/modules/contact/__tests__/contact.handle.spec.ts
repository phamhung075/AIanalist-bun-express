import { createHandler } from '../contact.handler';

jest.mock('@/_core/helper/validateZodSchema', () => ({
  validateSchema: jest.fn().mockImplementation(() => {
    return (req: any) => {
      if (!req.body.name) {
        const error = new Error('Name is required');
        throw error;
      }
    };
  }),
}));

jest.mock('../contact.controller.factory', () => ({
  __esModule: true,
  default: {
    createContact: jest.fn().mockImplementation((_req, res) => {
      res.status(201).json({
        id: '123',
        message: 'Contact created',
      });
    }),
  },
}));

describe('Contact Handler', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test message',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  // ✅ Test: Successful Contact Creation
  describe('createContact', () => {
    it('should validate the request and pass to controller', async () => {
      const mockController = require('../contact.controller.factory').default;

      await createHandler(mockRequest, mockResponse, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockController.createContact).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        id: '123',
        message: 'Contact created',
      });
    });

    // ✅ Test: Validation Error
    it('should handle validation errors', async () => {
      delete mockRequest.body.name;

      try {
        await createHandler(mockRequest, mockResponse, mockNext);
      } catch (error: any) {
        expect(error.message).toBe('Name is required');
      }
    });

    // ✅ Test: Controller Throws Error
    it('should handle errors from the controller', async () => {
      const mockController = require('../contact.controller.factory').default;
      
      mockController.createContact.mockImplementation(() => {
        throw new Error('Controller Error');
      });

      await expect(createHandler(mockRequest, mockResponse, mockNext)).rejects.toThrow('Controller Error');

      expect(mockController.createContact).toHaveBeenCalled();
    });

    // ✅ Test: Invalid Email Format
    it('should handle invalid email format gracefully', async () => {
      mockRequest.body.email = 'invalid-email';

      jest.mocked(require('@/_core/helper/validateZodSchema').validateSchema).mockImplementation(() => {
        throw new Error('Invalid email format');
      });

      try {
        await createHandler(mockRequest, mockResponse, mockNext);
      } catch (error: any) {
        expect(error.message).toBe('Invalid email format');
      }
    });

    // ✅ Test: Missing Phone Field
    it('should handle missing phone field', async () => {
      delete mockRequest.body.phone;

      jest.mocked(require('@/_core/helper/validateZodSchema').validateSchema).mockImplementation(() => {
        throw new Error('Phone is required');
      });

      try {
        await createHandler(mockRequest, mockResponse, mockNext);
      } catch (error: any) {
        expect(error.message).toBe('Phone is required');
      }
    });

    // ✅ Test: Missing Email Field
    it('should handle missing email field', async () => {
      delete mockRequest.body.email;

      jest.mocked(require('@/_core/helper/validateZodSchema').validateSchema).mockImplementation(() => {
        throw new Error('Email is required');
      });

      try {
        await createHandler(mockRequest, mockResponse, mockNext);
      } catch (error: any) {
        expect(error.message).toBe('Email is required');
      }
    });
  });
});
