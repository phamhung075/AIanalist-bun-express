import { describe, test, expect, beforeEach, mock } from "bun:test";
import { faker } from "@faker-js/faker";
import { BaseController } from "../BaseController";
import { BaseService } from "../BaseService";
import { BaseRepository } from "../BaseRepository";
import { Response, NextFunction } from "express";
import { CustomRequest } from "@/_core/helper/interfaces/CustomRequest.interface";
import _ERROR from "@/_core/helper/http-status/error";
import { PaginatedResult } from "@/_core/helper/interfaces/PaginationServer.interface";

// Test interfaces
interface TestEntity {
  id?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface CreateDTO {
  name: string;
  description: string;
}

interface UpdateDTO {
  name?: string;
  description?: string;
}

// Mock Repository
class MockRepository extends BaseRepository<TestEntity> {
  constructor() {
    super("test_collection", { softDelete: true });
  }
}

// Mock Service with properly typed methods
class MockService extends BaseService<TestEntity> {
  constructor() {
    const repository = new MockRepository();
    super(repository);
  }

  override create = async (
    data: Omit<TestEntity, "id">
  ): Promise<TestEntity | false> => {
    return false;
  };

  override update = async (
    id: string,
    data: Partial<TestEntity>
  ): Promise<TestEntity | null> => {
    return null;
  };

  override getAll = async (
    pagination: any
  ): Promise<PaginatedResult<TestEntity>> => {
    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
      executionTime: 0,
    };
  };
}

// Test Controller
class TestController extends BaseController<TestEntity, CreateDTO, UpdateDTO> {
  constructor(service: BaseService<TestEntity>) {
    super(service);
  }
}

describe("BaseController", () => {
  let controller: TestController;
  let service: MockService;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let sentResponse: any;

  beforeEach(() => {
    service = new MockService();
    controller = new TestController(service);
    sentResponse = null;

    // Mock response object
    mockRes = {
      status: mock((code: number) => {
        mockRes.statusCode = code;
        return mockRes;
      }),
      json: mock((data: any) => {
        sentResponse = { ...data, status: mockRes.statusCode };
        return mockRes;
      }),
      _status: 200,
    } as any;

    mockNext = mock(() => {});
  });

  describe("create", () => {
    test("should successfully create an entity", async () => {
      const testData: CreateDTO = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
      };

      const mockRequest = {
        body: testData,
      } as CustomRequest<CreateDTO>;

      const expectedEntity: TestEntity = {
        id: faker.string.uuid(),
        ...testData,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      service.create = mock(
        async (): Promise<TestEntity | false> => expectedEntity
      );

      await controller.create(mockRequest, mockRes as Response, mockNext);

      expect(service.create).toHaveBeenCalledWith(testData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(sentResponse).toMatchObject({
        success: true,
        status: 201,
        message: "Entity created successfully",
        data: expectedEntity,
      });
    });

    test("should handle creation failure", async () => {
      const mockRequest = {
        body: {} as CreateDTO,
      } as CustomRequest<CreateDTO>;

      service.create = mock(async (): Promise<TestEntity | false> => false);

      await controller.create(mockRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(_ERROR.BadRequestError));
    });
  });

  describe("getAll", () => {
    test("should return paginated results", async () => {
      const mockRequest = {
        query: {
          page: "1",
          limit: "10",
          sort: "createdAt",
          order: "desc",
        },
      } as unknown as CustomRequest;

      const mockResults: PaginatedResult<TestEntity> = {
        data: Array(10)
          .fill(null)
          .map(() => ({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
          })),
        total: 20,
        page: 1,
        limit: 10,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
        executionTime: 100,
      };

      service.getAll = mock(
        async (): Promise<PaginatedResult<TestEntity>> => mockResults
      );

      await controller.getAll(mockRequest, mockRes as Response, mockNext);

      await controller.getAll(mockRequest, mockRes as Response, mockNext);

      expect(service.getAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sort: "createdAt",
        order: "desc",
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(sentResponse).toMatchObject({
        success: true,
        status: 200,
        message: "Fetched entities successfully",
        pagination: mockResults,
      });
    });
  });

  describe("update", () => {
    test("should update entity successfully", async () => {
      const testId = faker.string.uuid();
      const updateData: UpdateDTO = {
        name: faker.commerce.productName(),
      };

      const mockRequest = {
        params: { id: testId },
        body: updateData,
      } as unknown as CustomRequest<UpdateDTO>;

      const updatedEntity: TestEntity = {
        id: testId,
        name: updateData.name!,
        description: faker.commerce.productDescription(),
        updatedAt: new Date(),
      };

      service.update = mock(
        async (): Promise<TestEntity | null> => updatedEntity
      );

      await controller.update(mockRequest, mockRes as Response, mockNext);

      expect(service.update).toHaveBeenCalledWith(testId, updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(sentResponse).toMatchObject({
        success: true,
        status: 200,
        message: "Entity updated successfully",
        data: updatedEntity,
      });
    });

    test("should handle update failure", async () => {
      const testId = faker.string.uuid();
      const mockRequest = {
        params: { id: testId },
        body: { name: "New Name" },
      } as unknown as CustomRequest<UpdateDTO>;

      service.update = mock(async (): Promise<TestEntity | null> => null);

      await controller.update(mockRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });

  describe("delete", () => {
    test("should delete entity successfully", async () => {
      const testId = faker.string.uuid();
      const mockRequest = {
        params: { id: testId },
      } as unknown as CustomRequest;

      service.delete = mock(async (): Promise<boolean> => true);

      await controller.delete(mockRequest, mockRes as Response, mockNext);

      expect(service.delete).toHaveBeenCalledWith(testId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(sentResponse).toMatchObject({
        success: true,
        status: 200,
        message: "Entity deleted successfully",
      });
    });

    test("should handle delete failure", async () => {
      const mockRequest = {
        params: { id: faker.string.uuid() },
      } as unknown as CustomRequest;

      service.delete = mock(async (): Promise<boolean> => false);

      await controller.delete(mockRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(_ERROR.NotFoundError));
    });
  });
});
