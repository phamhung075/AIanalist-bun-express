import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { BaseController } from '../BaseController';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import _ERROR from '@/_core/helper/http-status/error';
import { HttpStatusCode } from '@/_core/helper/http-status/common/HttpStatusCode';
import { createMockRepository, MockedBaseRepository } from '../__mocks__/BaseRepository.mocks';
import { createMockService, MockedBaseService } from '../__mocks__/BaseService.mocks';

// Test interfaces
interface TestDTO {
  id?: string;
  name: string;
  description: string;
}

interface CreateTestDTO {
  name: string;
  description: string;
}

interface UpdateTestDTO {
  name?: string;
  description?: string;
}

// Mock class implementation
class TestController extends BaseController<TestDTO, CreateTestDTO, UpdateTestDTO> {}

describe('BaseController', () => {
  let controller: TestController;
  let mockRepository: MockedBaseRepository<TestDTO>;
  let mockService: MockedBaseService<TestDTO>;
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    // Setup mocks with explicit typing
    mockRepository = createMockRepository<TestDTO>();
    mockService = createMockService<TestDTO>(mockRepository as any);
    controller = new TestController(mockService as any);

    // Reset request
    req = {
      body: {},
      params: {},
      query: {},
      startTime: Date.now()
    };

    // Reset response with proper type casting
    const mockRes = {
      status: mock((code: number) => mockRes),
      json: mock((data: any) => mockRes),
      send: mock((body: any) => mockRes),
      sendStatus: mock((code: number) => mockRes),
      end: mock(() => mockRes),
      locals: {},
      headersSent: false,
      app: {},
      req: {},
      charset: '',
      get: mock(() => ''),
      set: mock(() => mockRes),
      append: mock(() => mockRes),
      setHeader: mock(() => mockRes),
      header: mock(() => mockRes),
      links: mock(() => mockRes),
      location: mock(() => mockRes),
      render: mock(() => mockRes),
      type: mock(() => mockRes),
      format: mock(() => mockRes),
      attachment: mock(() => mockRes),
      getHeader: mock(() => ''),
      contentType: mock(() => mockRes),
      vary: mock(() => mockRes),
      clearCookie: mock(() => mockRes),
      cookie: mock(() => mockRes)
    };
    res = mockRes as unknown as Response;

    // Reset next function
    next = mock((error?: any) => {});
  });

  describe('create', () => {
    test('should successfully create an entity', async () => {
      const createData: CreateTestDTO = {
        name: 'Test Entity',
        description: 'Test Description'
      };

      req.body = createData;

      const expectedEntity: TestDTO = {
        id: '123',
        ...createData
      };

      mockService.create.mockImplementation(() => Promise.resolve(expectedEntity));

      await controller.create(req as CustomRequest<CreateTestDTO>, res as Response, next);

      expect(mockService.create.mock.calls.length).toBe(1);
      expect(mockService.create.mock.calls[0][0]).toEqual(createData);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: HttpStatusCode.CREATED,
        message: 'Entity created successfully',
        data: expectedEntity
      }));
    });

    test('should handle creation failure', async () => {
      req.body = {
        name: 'Test Entity',
        description: 'Test Description'
      };

      mockService.create.mockImplementation(() => Promise.resolve(false));

      await controller.create(req as CustomRequest<CreateTestDTO>, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.BadRequestError));
    });

    test('should handle creation error', async () => {
      req.body = {
        name: 'Test Entity',
        description: 'Test Description'
      };
    
      mockService.create.mockRejectedValue(new Error('Creation failed'));
    
      await controller.create(req as CustomRequest<CreateTestDTO>, res as Response, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
    
  });

  describe('getAll', () => {
    test('should successfully retrieve all entities', async () => {
      const entities: TestDTO[] = [
        { id: '1', name: 'Entity 1', description: 'Description 1' },
        { id: '2', name: 'Entity 2', description: 'Description 2' }
      ];

      mockService.getAll.mockImplementation(() => Promise.resolve(entities));

      await controller.getAll(req as CustomRequest, res as Response, next);

      expect(mockService.getAll.mock.calls.length).toBe(1);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: HttpStatusCode.OK,
        message: 'Fetched all entities successfully',
        data: entities
      }));
    });

    test('should handle empty results', async () => {
      mockService.getAll.mockImplementation(() => Promise.resolve([]));

      await controller.getAll(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });

    test('should handle empty results with correct message', async () => {
      mockService.getAll.mockImplementation(() => Promise.resolve([]));
    
      await controller.getAll(req as CustomRequest, res as Response, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('getById', () => {
    test('should successfully retrieve an entity by ID', async () => {
      const entity: TestDTO = {
        id: '123',
        name: 'Test Entity',
        description: 'Test Description'
      };

      req.params = { id: '123' };
      mockService.getById.mockImplementation(() => Promise.resolve(entity));

      await controller.getById(req as CustomRequest, res as Response, next);

      expect(mockService.getById.mock.calls.length).toBe(1);
      expect(mockService.getById.mock.calls[0][0]).toBe('123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: HttpStatusCode.OK,
        message: 'Fetched entity by ID successfully',
        data: entity
      }));
    });

    test('should handle non-existent entity', async () => {
      req.params = { id: 'nonexistent' };
      mockService.getById.mockImplementation(() => Promise.resolve(null));

      await controller.getById(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });

    test('should handle error when getting by ID', async () => {
      req.params = { id: '123' };
      mockService.getById.mockRejectedValue(new Error('Database error'));
    
      await controller.getById(req as CustomRequest, res as Response, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('update', () => {
    test('should successfully update an entity', async () => {
      const updateData: UpdateTestDTO = {
        name: 'Updated Name'
      };

      const updatedEntity: TestDTO = {
        id: '123',
        name: 'Updated Name',
        description: 'Original Description'
      };

      req.params = { id: '123' };
      req.body = updateData;

      mockService.update.mockImplementation(() => Promise.resolve(updatedEntity));

      await controller.update(req as CustomRequest<UpdateTestDTO>, res as Response, next);

      expect(mockService.update.mock.calls.length).toBe(1);
      expect(mockService.update.mock.calls[0]).toEqual(['123', updateData]);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: HttpStatusCode.OK,
        message: 'Entity updated successfully',
        data: updatedEntity
      }));
    });

    test('should handle update of non-existent entity', async () => {
      req.params = { id: 'nonexistent' };
      req.body = { name: 'Updated Name' };

      mockService.update.mockImplementation(() => Promise.resolve(null));

      await controller.update(req as CustomRequest<UpdateTestDTO>, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });

    test('should handle update error', async () => {
      req.params = { id: '123' };
      req.body = { name: 'Updated Name' };
      mockService.update.mockRejectedValue(new Error('Update failed'));
    
      await controller.update(req as CustomRequest<UpdateTestDTO>, res as Response, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('delete', () => {
    test('should successfully delete an entity', async () => {
      req.params = { id: '123' };
      mockService.delete.mockImplementation(() => Promise.resolve(true));

      await controller.delete(req as CustomRequest, res as Response, next);

      expect(mockService.delete.mock.calls.length).toBe(1);
      expect(mockService.delete.mock.calls[0][0]).toBe('123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: HttpStatusCode.OK,
        message: 'Entity deleted successfully'
      }));
    });

    test('should handle deletion of non-existent entity', async () => {
      req.params = { id: 'nonexistent' };
      mockService.delete.mockImplementation(() => Promise.resolve(false));

      await controller.delete(req as CustomRequest, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });

    test('should handle deletion error', async () => {
      req.params = { id: '123' };
      mockService.delete.mockRejectedValue(new Error('Deletion failed'));
    
      await controller.delete(req as CustomRequest, res as Response, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('paginator', () => {
    test('should successfully return paginated results', async () => {
      req.query = { page: '1', limit: '10', all: 'false' };

      const paginationResult = {
        data: [
          { id: '1', name: 'Entity 1', description: 'Description 1' },
          { id: '2', name: 'Entity 2', description: 'Description 2' }
        ],
        totalItems: 2,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      mockService.paginator.mockImplementation(() => Promise.resolve(paginationResult));

      await controller.paginator(req as CustomRequest, res as Response, next);

      expect(mockService.paginator.mock.calls.length).toBe(1);
      expect(mockService.paginator.mock.calls[0][0]).toEqual({
        page: 1,
        limit: 10,
        all: false
      });
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: HttpStatusCode.OK,
        message: 'Fetched paginated entities successfully',
        data: paginationResult
      }));
    });

    test('should handle all=true parameter', async () => {
      req.query = { all: 'true' };

      const paginationResult = {
        data: [
          { id: '1', name: 'Entity 1', description: 'Description 1' },
          { id: '2', name: 'Entity 2', description: 'Description 2' }
        ],
        totalItems: 2,
        count: 2,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      mockService.paginator.mockImplementation(() => Promise.resolve(paginationResult));

      await controller.paginator(req as CustomRequest, res as Response, next);

      expect(mockService.paginator.mock.calls[0][0].all).toBe(true);
    });

    test('should handle invalid query parameters', async () => {
      req.query = { page: 'a', limit: 'b', all: 'false' };
    
      await controller.paginator(req as CustomRequest, res as Response, next);
    
      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.BadRequestError));
    });
  });
});