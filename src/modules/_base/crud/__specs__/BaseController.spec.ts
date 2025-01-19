import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { faker } from '@faker-js/faker';
import { BaseController } from '../BaseController';
import { Response } from 'express';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import _ERROR from '@/_core/helper/http-status/error';
import { HttpStatusCode } from '@/_core/helper/http-status/common/HttpStatusCode';
import _SUCCESS from '@/_core/helper/http-status/success';
import { FetchPageResult } from '@/_core/helper/interfaces/FetchPageResult.interface';

// Test interfaces
interface TestDTO {
  id?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
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

// Helper functions
const createFakeEntity = (id?: string): TestDTO => ({
  id: id || faker.string.uuid(),
  name: faker.commerce.productName(),
  description: faker.commerce.productDescription(),
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent()
});

describe('BaseController', () => {
  let controller: TestController;
  let mockService: any;
  let req: Partial<CustomRequest>;
  let res: Response;
  let next: any;

  beforeEach(() => {
    mockService = {
      create: mock(() => Promise.resolve()),
      getAll: mock(() => Promise.resolve()),
      getById: mock(() => Promise.resolve()),
      update: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
      paginator: mock(() => Promise.resolve())
    };

    // Create mock response with status and json spies
    res = {
      status: mock((code: number) => res),
      json: mock((data: any) => res),
      locals: { startTime: Date.now() },
      headersSent: false
    } as unknown as Response;

    controller = new TestController(mockService);
    req = { 
      body: {},
      params: {},
      query: {},
      startTime: faker.date.recent().getTime()
    };
    next = mock();
  });

  describe('create', () => {
    test('should create entity and send success response', async () => {
      const inputData: CreateTestDTO = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };
      const createdEntity = createFakeEntity();

      req.body = inputData;
      mockService.create.mockResolvedValue(createdEntity);

      await controller.create(req as CustomRequest<CreateTestDTO>, res, next);

      expect(mockService.create).toHaveBeenCalledWith(inputData);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.CREATED);

            // console.log('Received:', (res.json as any).mock.calls[0][0]);
      // console.log('Expected:', {
      //   success: true,
      //   message: 'Fetched paginated entities successfully',
      //   pagination: paginationResult
      // });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Entity created successfully',
          data: createdEntity
        })
      );
    });

    test('should handle creation failure with BadRequestError', async () => {
      const inputData: CreateTestDTO = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };
      
      req.body = inputData;
      mockService.create.mockResolvedValue(null);

      await controller.create(req as CustomRequest<CreateTestDTO>, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.BadRequestError));
    });

    test('should pass service errors to next middleware', async () => {
      const error = new Error('Service error');
      req.body = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };
      mockService.create.mockRejectedValue(error);

      await controller.create(req as CustomRequest<CreateTestDTO>, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAll', () => {
    test('should return all entities with success response', async () => {
      const entities = Array.from({ length: 3 }, () => createFakeEntity());
      mockService.getAll.mockResolvedValue(entities);

      await controller.getAll(req as CustomRequest, res, next);

      expect(mockService.getAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Fetched all entities successfully',
          data: entities
        })
      );
    });

    test('should handle empty results with NotFoundError', async () => {
      mockService.getAll.mockResolvedValue([]);

      await controller.getAll(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('getById', () => {
    test('should return entity by id with success response', async () => {
      const entityId = faker.string.uuid();
      const entity = createFakeEntity(entityId);
      
      req.params = { id: entityId };
      mockService.getById.mockResolvedValue(entity);

      await controller.getById(req as CustomRequest, res, next);

      expect(mockService.getById).toHaveBeenCalledWith(entityId);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Fetched entity by ID successfully',
          data: entity
        })
      );
    });

    test('should handle non-existent entity with NotFoundError', async () => {
      const entityId = faker.string.uuid();
      req.params = { id: entityId };
      mockService.getById.mockResolvedValue(null);

      await controller.getById(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('update', () => {
    test('should update entity and send success response', async () => {
      const entityId = faker.string.uuid();
      const updateData: UpdateTestDTO = {
        name: faker.commerce.productName()
      };
      const updatedEntity = createFakeEntity(entityId);

      req.params = { id: entityId };
      req.body = updateData;
      mockService.update.mockResolvedValue(updatedEntity);

      await controller.update(req as CustomRequest<UpdateTestDTO>, res, next);

      expect(mockService.update).toHaveBeenCalledWith(entityId, updateData);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Entity updated successfully',
          data: updatedEntity
        })
      );
    });

    test('should handle non-existent entity update with NotFoundError', async () => {
      const entityId = faker.string.uuid();
      req.params = { id: entityId };
      req.body = { name: faker.commerce.productName() };
      mockService.update.mockResolvedValue(null);

      await controller.update(req as CustomRequest<UpdateTestDTO>, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('delete', () => {
    test('should delete entity and send success response', async () => {
      const entityId = faker.string.uuid();
      req.params = { id: entityId };
      mockService.delete.mockResolvedValue(true);

      await controller.delete(req as CustomRequest, res, next);

      expect(mockService.delete).toHaveBeenCalledWith(entityId);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Entity deleted successfully'
        })
      );
    });

    test('should handle non-existent entity delete with NotFoundError', async () => {
      const entityId = faker.string.uuid();
      req.params = { id: entityId };
      mockService.delete.mockResolvedValue(false);

      await controller.delete(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('paginator', () => {
    test('should return paginated results with success response', async () => {
      const paginationResult: FetchPageResult<TestDTO> = {
        data: Array.from({ length: 5 }, () => createFakeEntity()),
        totalItems: 5,
        count: 5,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      req.query = { page: '1', limit: '10', all: 'false' };
      mockService.paginator.mockResolvedValue(paginationResult);

      await controller.paginator(req as CustomRequest, res, next);

      expect(mockService.paginator).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        all: false
      });

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.OK);
      // console.log('Received:', (res.json as any).mock.calls[0][0]);
      // console.log('Expected:', {
      //   success: true,
      //   message: 'Fetched paginated entities successfully',
      //   pagination: paginationResult
      // });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Fetched paginated entities successfully',
          data: {},
          metadata: expect.objectContaining({
            description: expect.any(String),
            documentation: expect.any(String),
            timestamp: expect.any(String),
            responseTime: expect.any(String),
            code: HttpStatusCode.OK,
            status: 'OK'
          })
        })
      );
    });

    test('should handle invalid pagination parameters with BadRequestError', async () => {
      req.query = { page: 'invalid', limit: 'invalid' };

      await controller.paginator(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.BadRequestError));
    });
  });
});