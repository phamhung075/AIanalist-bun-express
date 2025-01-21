// import { describe, test, expect, beforeEach, mock } from "bun:test";
// import { faker } from '@faker-js/faker';
// import { BaseService } from "../BaseService";
// import { FetchPageResult } from "@/_core/helper/interfaces/FetchPageResult.interface";

// // Test interfaces
// interface TestEntity {
//   id?: string;
//   name: string;
//   email: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// // Test implementation of BaseService
// class TestService extends BaseService<TestEntity> {}

// describe("BaseService", () => {
//   let service: TestService;
//   let mockRepository: any;
//   let testData: Omit<TestEntity, "id">;

//   beforeEach(() => {
//     mockRepository = {
//       create: mock(() => Promise.resolve()),
//       createWithId: mock(() => Promise.resolve()),
//       getAll: mock(() => Promise.resolve()),
//       getById: mock(() => Promise.resolve()),
//       update: mock(() => Promise.resolve()),
//       delete: mock(() => Promise.resolve()),
//       paginator: mock(() => Promise.resolve())
//     };

//     service = new TestService(mockRepository);
    
//     // Generate fake test data
//     testData = {
//       name: faker.person.fullName(),
//       email: faker.internet.email()
//     };
//   });

//   describe("create", () => {
//     test("should successfully create an entity", async () => {
//       const expectedEntity: TestEntity = {
//         id: faker.string.uuid(),
//         ...testData,
//         createdAt: faker.date.recent(),
//         updatedAt: faker.date.recent()
//       };

//       mockRepository.create.mockImplementation(() => Promise.resolve(expectedEntity));

//       const result = await service.create(testData);

//       expect(result).toEqual(expectedEntity);
//       expect(mockRepository.create).toHaveBeenCalledTimes(1);
//       expect(mockRepository.create).toHaveBeenCalledWith(testData);
//     });

//     test("should handle creation failure", async () => {
//       const error = new Error("Creation failed");
//       mockRepository.create.mockImplementation(() => Promise.reject(error));

//       await expect(service.create(testData)).rejects.toThrow("Creation failed");
//       expect(mockRepository.create).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("createWithId", () => {
//     test("should create an entity with a specific ID", async () => {
//       const testId = faker.string.uuid();
//       const expectedEntity: TestEntity = {
//         id: testId,
//         ...testData,
//         createdAt: faker.date.recent(),
//         updatedAt: faker.date.recent()
//       };

//       mockRepository.createWithId.mockImplementation(() => Promise.resolve(expectedEntity));

//       const result = await service.createWithId(testId, testData);

//       expect(result).toEqual(expectedEntity);
//       expect(mockRepository.createWithId).toHaveBeenCalledTimes(1);
//       expect(mockRepository.createWithId).toHaveBeenCalledWith(testId, testData);
//     });

//     test("should handle createWithId failure", async () => {
//       const testId = faker.string.uuid();
//       const error = new Error("Creation with ID failed");
//       mockRepository.createWithId.mockImplementation(() => Promise.reject(error));

//       await expect(service.createWithId(testId, testData)).rejects.toThrow("Creation with ID failed");
//       expect(mockRepository.createWithId).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("getAll", () => {
//     test("should retrieve all entities", async () => {
//       const expectedEntities: TestEntity[] = Array.from({ length: 3 }, () => ({
//         id: faker.string.uuid(),
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         createdAt: faker.date.recent(),
//         updatedAt: faker.date.recent()
//       }));

//       mockRepository.getAll.mockImplementation(() => Promise.resolve(expectedEntities));

//       const result = await service.getAll();

//       expect(result).toEqual(expectedEntities);
//       expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
//     });

//     test("should handle empty results", async () => {
//       mockRepository.getAll.mockImplementation(() => Promise.resolve([]));

//       const result = await service.getAll();

//       expect(result).toEqual([]);
//       expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
//     });

//     test("should handle getAll failure", async () => {
//       const error = new Error("Fetch failed");
//       mockRepository.getAll.mockImplementation(() => Promise.reject(error));

//       await expect(service.getAll()).rejects.toThrow("Fetch failed");
//       expect(mockRepository.getAll).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("getById", () => {
//     test("should retrieve an entity by ID", async () => {
//       const testId = faker.string.uuid();
//       const expectedEntity: TestEntity = {
//         id: testId,
//         name: faker.person.fullName(),
//         email: faker.internet.email(),
//         createdAt: faker.date.recent(),
//         updatedAt: faker.date.recent()
//       };

//       mockRepository.getById.mockImplementation(() => Promise.resolve(expectedEntity));

//       const result = await service.getById(testId);

//       expect(result).toEqual(expectedEntity);
//       expect(mockRepository.getById).toHaveBeenCalledTimes(1);
//       expect(mockRepository.getById).toHaveBeenCalledWith(testId);
//     });

//     test("should handle non-existent entity", async () => {
//       const testId = faker.string.uuid();
//       mockRepository.getById.mockImplementation(() => Promise.resolve(null));

//       const result = await service.getById(testId);

//       expect(result).toBeNull();
//       expect(mockRepository.getById).toHaveBeenCalledTimes(1);
//     });

//     test("should handle getById failure", async () => {
//       const testId = faker.string.uuid();
//       const error = new Error("Fetch by ID failed");
//       mockRepository.getById.mockImplementation(() => Promise.reject(error));

//       await expect(service.getById(testId)).rejects.toThrow("Fetch by ID failed");
//       expect(mockRepository.getById).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("update", () => {
//     test("should update an existing entity", async () => {
//       const testId = faker.string.uuid();
//       const updateData = {
//         name: faker.person.fullName(),
//         email: faker.internet.email()
//       };

//       const expectedEntity: TestEntity = {
//         id: testId,
//         ...updateData,
//         updatedAt: faker.date.recent()
//       };

//       mockRepository.update.mockImplementation(() => Promise.resolve(expectedEntity));

//       const result = await service.update(testId, updateData);

//       expect(result).toEqual(expectedEntity);
//       expect(mockRepository.update).toHaveBeenCalledTimes(1);
//       expect(mockRepository.update).toHaveBeenCalledWith(testId, updateData);
//     });

//     test("should handle update of non-existent entity", async () => {
//       const testId = faker.string.uuid();
//       const updateData = {
//         name: faker.person.fullName()
//       };

//       mockRepository.update.mockImplementation(() => Promise.resolve(null));

//       const result = await service.update(testId, updateData);

//       expect(result).toBeNull();
//       expect(mockRepository.update).toHaveBeenCalledTimes(1);
//     });

//     test("should handle update failure", async () => {
//       const testId = faker.string.uuid();
//       const error = new Error("Update failed");
//       mockRepository.update.mockImplementation(() => Promise.reject(error));

//       await expect(service.update(testId, {})).rejects.toThrow("Update failed");
//       expect(mockRepository.update).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("delete", () => {
//     test("should successfully delete an entity", async () => {
//       const testId = faker.string.uuid();
//       mockRepository.delete.mockImplementation(() => Promise.resolve(true));

//       const result = await service.delete(testId);

//       expect(result).toBe(true);
//       expect(mockRepository.delete).toHaveBeenCalledTimes(1);
//       expect(mockRepository.delete).toHaveBeenCalledWith(testId);
//     });

//     test("should handle deletion of non-existent entity", async () => {
//       const testId = faker.string.uuid();
//       mockRepository.delete.mockImplementation(() => Promise.resolve(false));

//       const result = await service.delete(testId);

//       expect(result).toBe(false);
//       expect(mockRepository.delete).toHaveBeenCalledTimes(1);
//     });

//     test("should handle delete failure", async () => {
//       const testId = faker.string.uuid();
//       const error = new Error("Delete failed");
//       mockRepository.delete.mockImplementation(() => Promise.reject(error));

//       await expect(service.delete(testId)).rejects.toThrow("Delete failed");
//       expect(mockRepository.delete).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe("paginator", () => {
//     test("should return paginated results", async () => {
//       const options = {
//         page: faker.number.int({ min: 1, max: 5 }),
//         limit: faker.number.int({ min: 5, max: 20 }),
//         all: false
//       };

//       const mockData = Array.from({ length: 2 }, () => ({
//         id: faker.string.uuid(),
//         name: faker.person.fullName(),
//         email: faker.internet.email()
//       }));

//       const expectedResult: FetchPageResult<TestEntity> = {
//         data: mockData,
//         totalItems: mockData.length,
//         count: mockData.length,
//         page: options.page,
//         limit: options.limit,
//         totalPages: 1
//       };

//       mockRepository.paginator.mockImplementation(() => Promise.resolve(expectedResult));

//       const result = await service.paginator(options);

//       expect(result).toEqual(expectedResult);
//       expect(mockRepository.paginator).toHaveBeenCalledWith(options);
//     });

//     test("should handle empty paginated results", async () => {
//       const options = {
//         page: faker.number.int({ min: 1, max: 5 }),
//         limit: faker.number.int({ min: 5, max: 20 }),
//         all: false
//       };

//       const emptyResult: FetchPageResult<TestEntity> = {
//         data: [],
//         totalItems: 0,
//         count: 0,
//         page: options.page,
//         limit: options.limit,
//         totalPages: 0
//       };

//       mockRepository.paginator.mockImplementation(() => Promise.resolve(emptyResult));

//       const result = await service.paginator(options);

//       expect(result).toEqual(emptyResult);
//       expect(mockRepository.paginator).toHaveBeenCalledTimes(1);
//     });

//     test("should handle paginator failure", async () => {
//       const options = {
//         page: 1,
//         limit: 10,
//         all: false
//       };

//       const error = new Error("Pagination failed");
//       mockRepository.paginator.mockImplementation(() => Promise.reject(error));

//       await expect(service.paginator(options)).rejects.toThrow("Pagination failed");
//       expect(mockRepository.paginator).toHaveBeenCalledTimes(1);
//     });
//   });
// });