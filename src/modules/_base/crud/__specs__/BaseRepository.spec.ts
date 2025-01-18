import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "bun:test";
import { faker } from "@faker-js/faker";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { DocumentSnapshot } from "firebase-admin/firestore";
import { PaginationOptions } from "@/_core/helper/interfaces/PaginationServer.interface";
import { BaseRepository } from "../BaseRepository";

interface TestDocument {
  id?: string;
  name: string;
  email: string;
  status?: string;
  role?: string;
  age?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

class TestRepository extends BaseRepository<TestDocument> {
  constructor(softDelete: boolean = true) {
    super("test_collection", { softDelete });
  }

  async getDocumentSnapshot(id: string): Promise<DocumentSnapshot> {
    return await this.collection.doc(id).get();
  }

  // Helper method for cleanup
  async deleteAllDocuments() {
    const snapshot = await this.collection.get();
    const deletePromises = snapshot.docs.map(doc => this.collection.doc(doc.id).delete());
    await Promise.all(deletePromises);
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
    await repository.deleteAllDocuments();
  });

  describe("Document Creation", () => {
    test("should create a document with auto-generated ID", async () => {
      const testData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        status: "active",
      };

      const created = await repository.create(testData);

      expect(created.id).toBeDefined();
      expect(created.name).toBe(testData.name);
      expect(created.email).toBe(testData.email);
      expect(created.status).toBe(testData.status);
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
      expect(created.deletedAt).toBeNull();
    });

    test("should create a document with specified ID", async () => {
      const customId = faker.string.uuid();
      const testData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      const created = await repository.createWithId(customId, testData);

      expect(created.id).toBe(customId);
      expect(created.name).toBe(testData.name);
      expect(created.email).toBe(testData.email);
    });

    test("should throw error when creating document with existing ID", async () => {
      const customId = faker.string.uuid();
      const testData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      await repository.createWithId(customId, testData);

      await expect(
        repository.createWithId(customId, testData)
      ).rejects.toThrow(/existe déjà/);
    });
  });

  describe("Document Retrieval", () => {
    test("should retrieve a document by ID", async () => {
      const testData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      const created = await repository.create(testData);
      const retrieved = await repository.getById(created.id!);

      expect(retrieved).toEqual(created);
    });

    test("should throw error when retrieving non-existent document", async () => {
      const nonExistentId = faker.string.uuid();

      await expect(repository.getById(nonExistentId)).rejects.toThrow(
        /Document with ID .* not found/
      );
    });

    test("should retrieve all documents with pagination", async () => {
      // Create exactly three test documents
      const testDocs = [
        {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
        {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
        {
          name: faker.person.fullName(),
          email: faker.internet.email(),
        },
      ];

      // Create documents and store their IDs
      const createdDocs = await Promise.all(
        testDocs.map(doc => repository.create(doc))
      );

      // Verify we have exactly 3 documents
      const countSnapshot = await (repository as any).collection.get();
      expect(countSnapshot.size).toBe(3);

      // Test pagination
      const result = await repository.getAll({ page: 1, limit: 2, order: "asc" });

      // Verify pagination results
      expect(result.data.length).toBe(2); // First page should have 2 items
      expect(result.totalItems).toBe(3); // Total should be 3
      expect(result.hasNextPage).toBe(true); // Should have next page
      expect(result.hasPrevPage).toBe(false); // Should not have previous page
      
      // Verify second page
      const secondPage = await repository.getAll({ page: 2, limit: 2, order: "asc" });
      expect(secondPage.data.length).toBe(1); // Second page should have 1 item
      expect(secondPage.hasNextPage).toBe(false); // Should not have next page
      expect(secondPage.hasPrevPage).toBe(true); // Should have previous page
    });
  });

  describe("Document Updates", () => {
    test("should update a document", async () => {
      const original = await repository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
      });

      const updateData = {
        name: faker.person.fullName(),
        status: "inactive",
      };

      const updated = await repository.update(original.id!, updateData);

      expect(updated.id).toBe(original.id!);
      expect(updated.name).toBe(updateData.name);
      expect(updated.status).toBe(updateData.status);
      expect(updated.email).toBe(original.email);
      expect(updated.updatedAt!.getTime()).toBeGreaterThan(
        original.updatedAt!.getTime()
      );
    });

    test("should throw error when updating non-existent document", async () => {
      const nonExistentId = faker.string.uuid();

      await expect(
        repository.update(nonExistentId, {
          name: faker.person.fullName(),
        })
      ).rejects.toThrow(/Document with ID .* not found/);
    });

    test("should throw error when updating soft-deleted document", async () => {
      const doc = await repository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
      });

      await repository.delete(doc.id!);

      await expect(
        repository.update(doc.id!, {
          name: faker.person.fullName(),
        })
      ).rejects.toThrow(/Document with ID .* has been deleted/);
    });
  });

  describe("Document Deletion", () => {
    test("should soft delete a document by default", async () => {
      const doc = await repository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
      });

      const result = await repository.delete(doc.id!);
      expect(result).toBe(true);

      await expect(repository.getById(doc.id!)).rejects.toThrow(
        /Document with ID .* has been deleted/
      );

      const snapshot = await repository.getDocumentSnapshot(doc.id!);
      const data = snapshot.data();
      expect(data?.deletedAt).toBeDefined();
      expect(data?.deletedAt.toDate()).toBeInstanceOf(Date);
    });

    test("should hard delete when softDelete is disabled", async () => {
      const hardDeleteRepo = new TestRepository(false);
      const doc = await hardDeleteRepo.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
      });

      const result = await hardDeleteRepo.delete(doc.id!);
      expect(result).toBe(true);

      const snapshot = await hardDeleteRepo.getDocumentSnapshot(doc.id!);
      expect(snapshot.exists).toBe(false);
    });

    test("should throw error when deleting non-existent document", async () => {
      const nonExistentId = faker.string.uuid();

      await expect(repository.delete(nonExistentId)).rejects.toThrow(
        /Document avec l'ID .* non trouvé/
      );
    });
  });

  describe("Pagination and Filtering", () => {
    test("should paginate results with basic options", async () => {
      await Promise.all(
        Array(5).fill(null).map(() =>
          repository.create({
            name: faker.person.fullName(),
            email: faker.internet.email(),
          })
        )
      );

      const result = await repository.paginate({
        page: 1,
        limit: 3,
      });

      expect(result.data.length).toBe(3);
      expect(result.total).toBeGreaterThan(0);
      expect(result.page).toBe(1);
      expect(result.hasNextPage).toBe(true);
    });

    test("should apply filters in pagination", async () => {
      await Promise.all([
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          status: "active",
          role: "admin",
        }),
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          status: "active",
          role: "user",
        }),
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          status: "inactive",
          role: "user",
        }),
      ]);

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
        filters: [{ key: "status", operator: "==", value: "active" }],
        includeSoftDeleted: false,
      };

      const result = await repository.paginate(options);

      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2);
      expect(result.data.every((doc) => doc.status === "active")).toBe(true);
    });

    test("should apply composite filters", async () => {
      await Promise.all([
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          status: "active",
          role: "admin",
          age: 30,
        }),
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          status: "active",
          role: "user",
          age: 25,
        }),
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
          status: "inactive",
          role: "admin",
          age: 35,
        }),
      ]);

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
        compositeFilters: [{
          type: "and",
          conditions: [
            { key: "status", operator: "==", value: "active" },
            { key: "role", operator: "==", value: "admin" },
          ],
        }],
      };

      const result = await repository.paginate(options);

      expect(result.data.length).toBe(1);
      expect(result.data[0].status).toBe("active");
      expect(result.data[0].role).toBe("admin");
    });

    test("should handle date range filters", async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago

      await Promise.all([
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
        }),
        repository.create({
          name: faker.person.fullName(),
          email: faker.internet.email(),
        }),
      ]);

      const options: PaginationOptions = {
        page: 1,
        limit: 10,
        dateRange: {
          field: "createdAt",
          start: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
          end: new Date(),
        },
      };

      const result = await repository.paginate(options);

      expect(result.data.length).toBe(2);
    });
  });
});