import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { NextFunction, Response } from 'express';

import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { FetchPageResult } from '@/_core/helper/interfaces/FetchPageResult.interface';
import { createMockController, MockedBaseController } from '../BaseController.mocks';
import { MockBaseRepository } from '../BaseRepository.mocks';
import { createMockService, MockBaseService, MockedBaseService } from '../BaseService.mocks';

interface TestEntity {
  id?: string;
  name: string;
  age: number;
}

describe('MockBaseController', () => {
  let mockService: MockedBaseService<TestEntity>;
  let mockController: MockedBaseController<TestEntity, Omit<TestEntity, 'id'>, Partial<TestEntity>>;
  let mockRes: Response;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockService = createMockService<TestEntity>(MockBaseRepository as any);
    mockController = createMockController<TestEntity, Omit<TestEntity, 'id'>, Partial<TestEntity>>(mockService as any);
    
    mockRes = {
      json: mock(),
      status: mock(() => mockRes),
    } as unknown as Response;

    mockNext = mock();
  });

  test('create should return created entity', async () => {
    const testData = { name: 'Test', age: 25 };
    const expectedResult = { id: 'test-id', ...testData };
    mockService.create.mockImplementation(() => Promise.resolve(expectedResult));

    const req = { body: testData, startTime: Date.now() } as CustomRequest<Omit<TestEntity, 'id'>>;
    const result = await mockController.create(req, mockRes, mockNext);

    expect(result).toEqual({
      success: true,
      message: 'Entity created successfully',
      data: expectedResult,
      metadata: expect.any(Object),
    });
  });

  test('create should handle service failure', async () => {
    const testData = { name: 'Test', age: 25 };
    mockService.create.mockImplementation(() => {
      throw new Error('Service Failure');
    });
  
    const req = { body: testData, startTime: Date.now() } as CustomRequest<Omit<TestEntity, 'id'>>;
    await mockController.create(req, mockRes, mockNext);
  
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  test('createWithId should return created entity when ID is provided', async () => {
    const testData = { id: 'test-id', name: 'Test', age: 25 };
    const expectedResult = { ...testData };
  
    mockService.create.mockImplementation(() => Promise.resolve(expectedResult));
  
    const req = {
      body: testData,
      startTime: Date.now(),
    } as unknown as CustomRequest<TestEntity>;
  
    const result = await mockController.createWithId(req, mockRes, mockNext);
  
    expect(result).toEqual({
      success: true,
      message: 'Entity created successfully with provided ID',
      data: expectedResult,
      metadata: expect.any(Object),
    });
  });
  test('createWithId should throw an error when ID is missing', async () => {
    const testData = { name: 'Test', age: 25 }; // No ID provided
  
    const req = {
      body: testData,
      startTime: Date.now(),
    } as unknown as CustomRequest<TestEntity>;
  
    await mockController.createWithId(req, mockRes, mockNext);
  
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
  

  test('getAll should return all entities', async () => {
    const expectedResults = [{ id: '1', name: 'Test', age: 25 }];
    mockService.getAll.mockImplementation(() => Promise.resolve(expectedResults));

    const req = { startTime: Date.now() } as CustomRequest;
    const result = await mockController.getAll(req, mockRes, mockNext);

    expect(result).toEqual({
      success: true,
      message: 'Fetched all entities successfully',
      data: expectedResults,
      metadata: expect.any(Object),
    });
  });

  test('getById should return an entity', async () => {
    const expectedEntity = { id: '1', name: 'Test', age: 25 };
    mockService.getById.mockImplementation(() => Promise.resolve(expectedEntity));

    const req = { params: { id: '1' }, startTime: Date.now() } as unknown as CustomRequest;
    const result = await mockController.getById(req, mockRes, mockNext);

    expect(result).toEqual({
      success: true,
      message: 'Fetched entity by ID successfully',
      data: expectedEntity,
      metadata: expect.any(Object),
    });
  });

  test('update should return updated entity', async () => {
    const testUpdates = { name: 'Updated Test' };
    const expectedEntity = { id: '1', name: 'Updated Test', age: 25 };
    mockService.update.mockImplementation(() => Promise.resolve(expectedEntity));

    const req = { params: { id: '1' }, body: testUpdates, startTime: Date.now() } as unknown as CustomRequest;
    const result = await mockController.update(req, mockRes, mockNext);

    expect(result).toEqual({
      success: true,
      message: 'Entity updated successfully',
      data: expectedEntity,
      metadata: expect.any(Object),
    });
  });

  test('delete should return success', async () => {
    mockService.delete.mockImplementation(() => Promise.resolve(true));

    const req = { params: { id: '1' }, startTime: Date.now() } as unknown as CustomRequest;
    const result = await mockController.delete(req, mockRes, mockNext);

    expect(result).toEqual({
      success: true,
      message: 'Entity deleted successfully',
      metadata: expect.any(Object),
    });
  });

  test('paginator should return paginated results', async () => {
    const expectedResults: FetchPageResult<TestEntity> = {
      data: [{ id: '1', name: 'Test', age: 25 }],
      totalItems: 1,
      count: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };
    mockService.paginator.mockImplementation(() => Promise.resolve(expectedResults));

    const req = { query: { page: '1', limit: '10' }, startTime: Date.now() } as unknown as CustomRequest;
    const result = await mockController.paginator(req, mockRes, mockNext);

    expect(result).toEqual({
      success: true,
      message: 'Fetched paginated entities successfully',
      data: expectedResults,
      metadata: expect.any(Object),
    });
  });

  test('_reset should clear all mocks', async () => {
    // Mocking a valid CustomRequest
    const mockReq = {
      body: { name: 'Test', age: 25 }, // Required properties
      params: {},
      query: {},
      startTime: Date.now(), // Ensure this property exists
    } as unknown as CustomRequest<Omit<TestEntity, 'id'>>;
  
    await mockController.create(mockReq, mockRes, mockNext);
    await mockController.getAll(mockReq, mockRes, mockNext);
    await mockController.getById({ params: { id: '1' }, startTime: Date.now() } as unknown as CustomRequest, mockRes, mockNext);
  
    expect(mockController.create.mock.calls.length).toBe(1);
    expect(mockController.getAll.mock.calls.length).toBe(1);
    expect(mockController.getById.mock.calls.length).toBe(1);
  
    mockController._reset();
  
    expect(mockController.create.mock.calls.length).toBe(0);
    expect(mockController.getAll.mock.calls.length).toBe(0);
    expect(mockController.getById.mock.calls.length).toBe(0);
  });
  
});
