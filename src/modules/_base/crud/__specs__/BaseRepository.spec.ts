import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { faker } from "@faker-js/faker";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { DocumentSnapshot } from "firebase-admin/firestore";
import { BaseRepository } from "../BaseRepository";

interface TestEntity {
  id?: string;
  name: string;
  description: string;
  priority?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor() {
    super("test_collection");
  }

  async getDocumentSnapshot(id: string): Promise<DocumentSnapshot> {
    return await this.collection.doc(id).get();
  }
}

describe("BaseRepository", () => {
  let repository: TestRepository;
  let app: any;

  beforeAll(async () => {
    process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:9098";

    const existingApps = getApps();
    await Promise.all(existingApps.map((app) => deleteApp(app)));

    app = initializeApp({
      projectId: "demo-test",
      apiKey: "test-api-key",
      authDomain: "demo-test.firebaseapp.com",
    });
    
    const firestore = getFirestore(app);
    connectFirestoreEmulator(firestore, "127.0.0.1", 9098);
  });

  afterAll(async () => {
    if (app) {
      await deleteApp(app);
    }
  });

  beforeEach(async () => {
    repository = new TestRepository();
    const allDocs = await repository.getAll();
    await Promise.all(allDocs.map(doc => repository.delete(doc.id!)));
  });

  describe("CRUD operations", () => {
    test("should create and retrieve a document", async () => {
      const testData = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };

      const created = await repository.create(testData);
      expect(created.id).toBeDefined();
      expect(created.name).toBe(testData.name);
      expect(created.description).toBe(testData.description);

      const retrieved = await repository.getById(created.id!);
      expect(retrieved?.name).toBe(testData.name);
    });

    test("should create a document with specific ID", async () => {
      const customId = `test-${faker.string.uuid()}`;
      const testData = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };

      const created = await repository.createWithId(customId, testData);
      expect(created.id).toBe(customId);
      expect(created.name).toBe(testData.name);

      const retrieved = await repository.getById(customId);
      expect(retrieved?.id).toBe(customId);
    });

    test("should throw error when creating with invalid ID", async () => {
      const invalidId = "invalid/id";
      const testData = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };

      await expect(repository.createWithId(invalidId, testData))
        .rejects
        .toThrow();
    });

    test("should get all documents", async () => {
      const testData = Array(3).fill(null).map(() => ({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      }));

      await Promise.all(testData.map(data => repository.create(data)));

      const allDocs = await repository.getAll();
      expect(allDocs.length).toBe(3);
      allDocs.forEach(doc => {
        expect(doc.id).toBeDefined();
        expect(doc.name).toBeDefined();
        expect(doc.description).toBeDefined();
      });
    });

    test("should update a document", async () => {
      const original = await repository.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      });

      const updateData = {
        name: faker.commerce.productName()
      };

      const updated = await repository.update(original.id!, updateData);
      expect(updated?.id).toBe(original.id);
      expect(updated?.name).toBe(updateData.name);
      expect(updated?.description).toBe(original.description);
    });

    test("should delete a document", async () => {
      const created = await repository.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      });

      const result = await repository.delete(created.id!);
      expect(result).toBe(true);

      await expect(repository.getById(created.id!))
        .rejects
        .toThrow(/Document with ID .* not found/);
    });
  });

  describe("error handling", () => {
    test("should handle not found errors", async () => {
      const nonExistentId = faker.string.uuid();
      await expect(repository.getById(nonExistentId))
        .rejects
        .toThrow(/Document with ID .* not found/);
    });

    test("should handle update on non-existent document", async () => {
      const nonExistentId = faker.string.uuid();
      await expect(repository.update(nonExistentId, { name: "New Name" }))
        .rejects
        .toThrow(/Document with ID .* not found/);
    });

    test("should handle delete on non-existent document", async () => {
      const nonExistentId = faker.string.uuid();
      await expect(repository.delete(nonExistentId))
        .rejects
        .toThrow(/Document with ID .* not found/);
    });
  });

  describe("pagination", () => {
    test("should handle pagination with filters and ordering", async () => {
      // Create test documents with different statuses
      await Promise.all([
        repository.create({
          name: "A",
          description: "Test 1",
          priority: "high",
          status: "active"
        }),
        repository.create({
          name: "B",
          description: "Test 2",
          priority: "low",
          status: "active"
        }),
        repository.create({
          name: "C",
          description: "Test 3",
          priority: "low",
          status: "inactive"
        })
      ]);

      const result = await repository.paginator({
        page: 1,
        limit: 10,
        filters: [
          { key: "status", operator: "==", value: "active" }
        ],
        orderBy: {
          field: "name",
          direction: "asc"
        }
      });

      expect(result.data.length).toBe(2);
      expect(result.data[0].name).toBe("A");
      expect(result.data[1].name).toBe("B");
    });

    test("should handle pagination with lastVisible cursor", async () => {
      const items = await Promise.all(
        Array(15).fill(null).map((_, index) => 
          repository.create({
            name: `Test ${String(index).padStart(2, '0')}`,
            description: faker.commerce.productDescription()
          })
        )
      );

      const firstPage = await repository.paginator({
        page: 1,
        limit: 5,
        orderBy: {
          field: "name",
          direction: "asc"
        }
      });

      const lastDoc = await repository.getDocumentSnapshot(firstPage.data[4].id!);

      const secondPage = await repository.paginator({
        page: 2,
        limit: 5,
        orderBy: {
          field: "name",
          direction: "asc"
        },
        lastVisible: lastDoc
      });

      expect(secondPage.data.length).toBe(5);
      expect(secondPage.page).toBe(2);
      
      const firstPageNames = new Set(firstPage.data.map(doc => doc.name));
      const secondPageNames = new Set(secondPage.data.map(doc => doc.name));
      expect(intersection(firstPageNames, secondPageNames).size).toBe(0);
    });
  });
});

function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const elem of setA) {
    if (setB.has(elem)) {
      result.add(elem);
    }
  }
  return result;
}