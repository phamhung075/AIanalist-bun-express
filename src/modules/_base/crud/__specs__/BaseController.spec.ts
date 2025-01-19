import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { faker } from '@faker-js/faker';
import { BaseController } from '../BaseController';
import { Response } from 'express';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import _ERROR from '@/_core/helper/http-status/error';
import { HttpStatusCode } from '@/_core/helper/http-status/common/HttpStatusCode';
import _SUCCESS from '@/_core/helper/http-status/success';

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

const createMockResponse = () => {
  const res = {
    status: mock((code: number) => res),
    json: mock((data: any) => res),
    send: mock((body: any) => res),
    sendStatus: mock((code: number) => res),
    locals: {},
    headersSent: false
  };
  return res as unknown as Response;
};

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

    controller = new TestController(mockService);
    req = { 
      body: {},
      params: {},
      query: {},
      startTime: faker.date.recent().getTime()
    };
    res = createMockResponse();
    next = mock();
  });

  describe('create', () => {
    test('should create entity successfully', async () => {
      const inputData: CreateTestDTO = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };
      const createdEntity = createFakeEntity();

      req.body = inputData;
      mockService.create.mockResolvedValue(createdEntity);

      await controller.create(req as CustomRequest<CreateTestDTO>, res, next);

      expect(mockService.create).toHaveBeenCalledWith(inputData);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatusCode.CREATED,
          message: 'Entity created successfully',
          data: createdEntity
        })
      );
    });

    test('should handle creation failure', async () => {
      req.body = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };
      mockService.create.mockResolvedValue(false);

      await controller.create(req as CustomRequest<CreateTestDTO>, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.BadRequestError));
    });

    test('should handle service error', async () => {
      req.body = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };
      const error = new Error('Service error');
      mockService.create.mockRejectedValue(error);

      await controller.create(req as CustomRequest<CreateTestDTO>, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAll', () => {
    test('should return all entities successfully', async () => {
      const entities = Array(3).fill(null).map(() => createFakeEntity());
      mockService.getAll.mockResolvedValue(entities);

      await controller.getAll(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatusCode.OK,
          message: 'Fetched all entities successfully',
          data: entities
        })
      );
    });

    test('should handle empty results', async () => {
      mockService.getAll.mockResolvedValue([]);

      await controller.getAll(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('getById', () => {
    test('should return entity by id successfully', async () => {
      const entityId = faker.string.uuid();
      const entity = createFakeEntity(entityId);
      
      req.params = { id: entityId };
      mockService.getById.mockResolvedValue(entity);

      await controller.getById(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatusCode.OK,
          message: 'Fetched entity by ID successfully',
          data: entity
        })
      );
    });

    test('should handle non-existent entity', async () => {
      req.params = { id: faker.string.uuid() };
      mockService.getById.mockResolvedValue(null);

      await controller.getById(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('update', () => {
    test('should update entity successfully', async () => {
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
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatusCode.OK,
          message: 'Entity updated successfully',
          data: updatedEntity
        })
      );
    });

    test('should handle non-existent entity update', async () => {
      req.params = { id: faker.string.uuid() };
      req.body = { name: faker.commerce.productName() };
      mockService.update.mockResolvedValue(null);

      await controller.update(req as CustomRequest<UpdateTestDTO>, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe('paginator', () => {
    test('should return paginated results successfully', async () => {
      const paginationResult = {
        data: Array(5).fill(null).map(() => createFakeEntity()),
        totalItems: 5,
        count: 5,
        page: 1,
        limit: 10,
        totalPages: 1
      };

      req.query = { page: '1', limit: '10', all: 'false' };
      mockService.paginator.mockResolvedValue(paginationResult);

      await controller.paginator(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatusCode.OK,
          message: 'Fetched paginated entities successfully',
          pagination: paginationResult
        })
      );
    });

    test('should handle invalid query parameters', async () => {
      req.query = { page: 'invalid', limit: 'invalid' };

      await controller.paginator(req as CustomRequest, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(_ERROR.BadRequestError));
    });
  });
});