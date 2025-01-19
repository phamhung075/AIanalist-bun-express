import {
  describe,
  test,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from "bun:test";
import { faker } from "@faker-js/faker";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { BaseRepository } from "../BaseRepository";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Test interfaces
interface TestEntity {
  id?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Test implementation of BaseRepository
class TestRepository extends BaseRepository<TestEntity> {
  constructor() {
    super("test_collection");
  }
}

// Test configuration
const testConfig = {
  projectId: "demo-test",
  apiKey: "test-api-key",
  authDomain: "demo-test.firebaseapp.com",
};

describe("BaseRepository", () => {
  let repository: TestRepository;
  let app: any;

  beforeAll(async () => {
    // Set up Firestore emulator
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:9098";

    // Clean up existing apps
    const existingApps = getApps();
    await Promise.all(existingApps.map((app) => deleteApp(app)));

    // Initialize Firebase
    app = initializeApp(testConfig);
    const firestore = getFirestore(app);

    // Connect to emulator
    connectFirestoreEmulator(firestore, "127.0.0.1", 9098);

    // Wait for connection
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    if (app) {
      await deleteApp(app);
    }
  });

  beforeEach(() => {
    repository = new TestRepository();
  });

  describe("create", () => {
    test("should create a new document", async () => {
      const testData: Omit<TestEntity, "id"> = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
      };

      const result = await repository.create(testData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.description).toBe(testData.description);
    });

    test("should create a document with specific ID", async () => {
      const testId = faker.string.uuid();
      const testData: Omit<TestEntity, "id"> = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
      };

      const result = await repository.createWithId(testId, testData);

      expect(result).toBeDefined();
      expect(result.id).toBe(testId);
      expect(result.name).toBe(testData.name);
      expect(result.description).toBe(testData.description);
    });
  });

  describe("getById", () => {
    test("should retrieve a document by ID", async () => {
      // First create a document
      const testData: Omit<TestEntity, "id"> = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
      };
      const created = await repository.create(testData);

      // Then retrieve it
      const result = await repository.getById(created.id!);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id as string);
      expect(result?.name).toBe(testData.name);
    });

    test("should return null for non-existent ID", async () => {
      await expect(repository.getById("non-existent-id")).rejects.toThrow(
        /Document with ID .* not found/
      );
    });
  });

  describe("update", () => {
    test("should update an existing document", async () => {
      // First create a document
      const testData: Omit<TestEntity, "id"> = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
      };
      const created = await repository.create(testData);

      // Then update it
      const updateData = {
        name: faker.commerce.productName(),
      };
      const result = await repository.update(created.id!, updateData);

      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id as string);
      expect(result?.name).toBe(updateData.name);
      expect(result?.description).toBe(testData.description);
    });

    test("should throw error when updating non-existent document", async () => {
      const updateData = {
        name: faker.commerce.productName(),
      };

      await expect(
        repository.update("non-existent-id", updateData)
      ).rejects.toThrow(/Document with ID .* not found/);
    });
  });

  describe("delete", () => {
    test("should delete an existing document", async () => {
      // First create a document
      const testData: Omit<TestEntity, "id"> = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
      };
      const created = await repository.create(testData);

      // Then delete it
      const result = await repository.delete(created.id!);
      expect(result).toBe(true);

      // Verify it's deleted
      await expect(repository.getById(created.id!)).rejects.toThrow(
        /Document with ID .* not found/
      );
    });

    test("should throw error when deleting non-existent document", async () => {
      await expect(repository.delete("non-existent-id")).rejects.toThrow(
        /Document with ID .* not found/
      );
    });
  });

  describe("paginator", () => {
    test("should return paginated results", async () => {
      // Create multiple documents
      const testEntities = await Promise.all(
        Array(15)
          .fill(null)
          .map(() =>
            repository.create({
              name: faker.commerce.productName(),
              description: faker.commerce.productDescription(),
            })
          )
      );

      const result = await repository.paginator({
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.totalItems).toBeGreaterThanOrEqual(15);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test("should handle filters", async () => {
      const uniqueName = faker.string.uuid();

      // Create a document with unique name
      await repository.create({
        name: uniqueName,
        description: faker.commerce.productDescription(),
      });

      const result = await repository.paginator({
        page: 1,
        limit: 10,
        filters: [{ key: "name", operator: "==", value: uniqueName }],
      });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe(uniqueName);
    });

    test("should handle ordering", async () => {
      // Create documents with predictable names using timestamp to ensure uniqueness
      const timestamp = Date.now();
      const testNames = [`A_${timestamp}`, `B_${timestamp}`, `C_${timestamp}`];

      await Promise.all(
        testNames.map((name) =>
          repository.create({
            name,
            description: "desc",
          })
        )
      );

      const result = await repository.paginator({
        page: 1,
        limit: 10,
        filters: [
          // Filter to only get our test documents
          {
            key: "name",
            operator: "in",
            value: testNames as unknown as string,
          },
        ],
        orderBy: {
          field: "name",
          direction: "desc",
        },
      });

      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(3);

      // Get just the names from our result
      const resultNames = result.data.map((item) => item.name);

      // Sort our test names in reverse order for comparison
      const expectedNames = [...testNames].sort((a, b) => b.localeCompare(a));

      // Compare the arrays
      expect(resultNames).toEqual(expectedNames);

      // Verify descending order
      for (let i = 1; i < resultNames.length; i++) {
        expect(resultNames[i - 1] > resultNames[i]).toBe(true);
      }
    });
  });
});
