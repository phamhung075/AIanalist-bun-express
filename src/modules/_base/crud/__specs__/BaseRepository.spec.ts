import { describe, test, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { faker } from "@faker-js/faker";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { DocumentSnapshot } from "firebase-admin/firestore";
import { BaseRepository } from "../BaseRepository";
import { PaginationInput } from "@/_core/helper/validateZodSchema/Pagination.validation";

interface TestEntity {
  id?: string;
  name: string;
  description: string;
  priority?: string;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(softDelete: boolean = true) {
    super("test_collection", { softDelete });
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
    const allDocs = await repository.getAll({ page: 1, limit: 100, order: "asc" });
    await Promise.all(allDocs.data.map(doc => repository.delete(doc.id!)));
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
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
      expect(created.deletedAt).toBeNull();

      const retrieved = await repository.getById(created.id!);
      expect(retrieved).toEqual(created);
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
      expect(created.createdAt).toBeInstanceOf(Date);

      const retrieved = await repository.getById(customId);
      expect(retrieved).toEqual(created);
    });

    test("should prevent duplicate IDs when using createWithId", async () => {
      const customId = `test-${faker.string.uuid()}`;
      const testData = {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      };

      await repository.createWithId(customId, testData);
      await expect(repository.createWithId(customId, testData))
        .rejects
        .toThrow(/Document with ID .* already exists/);
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
      expect(updated.id).toBe(original.id!);
      expect(updated.name).toBe(updateData.name);
      expect(updated.description).toBe(original.description);
      expect(updated.updatedAt!.getTime()).toBeGreaterThan(original.updatedAt!.getTime());
    });
  });

  describe("Soft Delete", () => {
    test("should soft delete a document by default", async () => {
      const doc = await repository.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      });
    
      await repository.delete(doc.id!);
    
      // Should throw when trying to get by ID
      await expect(repository.getById(doc.id!))
        .rejects
        .toThrow(/Document with ID .* has been deleted/);
    
      // Verify document still exists with deletedAt timestamp
      const snapshot = await repository.getDocumentSnapshot(doc.id!);
      const data = snapshot.data();
      
      // Check if deletedAt exists and is a Firestore Timestamp
      expect(data?.deletedAt).toBeDefined();
      expect(data?.deletedAt.toDate()).toBeInstanceOf(Date);
      // Optional: Verify it's a recent timestamp
      const now = new Date();
      const deletedAtDate = data?.deletedAt.toDate();
      expect(deletedAtDate.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(deletedAtDate.getTime()).toBeGreaterThan(now.getTime() - 5000); // within last 5 seconds
    });

    test("should hard delete when softDelete is disabled", async () => {
      const hardDeleteRepo = new TestRepository(false);
      const doc = await hardDeleteRepo.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      });

      await hardDeleteRepo.delete(doc.id!);

      const snapshot = await hardDeleteRepo.getDocumentSnapshot(doc.id!);
      expect(snapshot.exists).toBe(false);
    });
  });

  describe("Pagination", () => {
    test("should paginate with default options", async () => {
      // Create 15 documents
      await Promise.all(
        Array(15).fill(null).map((_, i) => 
          repository.create({
            name: `Test ${String(i).padStart(2, '0')}`,
            description: faker.commerce.productDescription()
          })
        )
      );

      const pagination: PaginationInput = {
        page: 1,
        limit: 10,
        order: "asc"
      };

      const result = await repository.getAll(pagination);
      expect(result.data.length).toBe(10);
      expect(result.total).toBe(15);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(2);
      expect(result.executionTime).toBeDefined();
    });

    test("should handle advanced pagination with filters", async () => {
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

      const result = await repository.paginate({
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
      expect(result.total).toBe(2);
      expect(result.data[0].name).toBe("A");
      expect(result.data[1].name).toBe("B");
      expect(result.appliedFilters?.filters).toEqual({ status: "active" });
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid document IDs", async () => {
      const invalidId = "invalid/id";
      await expect(repository.getById(invalidId))
        .rejects
        .toThrow();
    });

    test("should handle update on non-existent document", async () => {
      const nonExistentId = faker.string.uuid();
      await expect(repository.update(nonExistentId, { name: "New Name" }))
        .rejects
        .toThrow(/Document with ID .* not found/);
    });

    test("should handle update on soft-deleted document", async () => {
      const doc = await repository.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription()
      });

      await repository.delete(doc.id!);

      await expect(repository.update(doc.id!, { name: "Updated Name" }))
        .rejects
        .toThrow(/Document with ID .* has been deleted/);
    });
  });
});