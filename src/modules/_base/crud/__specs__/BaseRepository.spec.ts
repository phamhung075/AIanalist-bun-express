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
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

class TestRepository extends BaseRepository<TestDocument> {
  constructor(softDelete: boolean = true) {
    super("test_collection", { softDelete });
  }

  // Add method to expose document snapshot for testing
  async getDocumentSnapshot(id: string): Promise<DocumentSnapshot> {
    return await this.collection.doc(id).get();
  }
}

describe("ServerRepository", () => {
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
    // Clean up existing documents before each test
    const result = await repository.paginate({ page: 1, limit: 100 });
    await Promise.all(
      (result.data || []).map((doc: { id: string }) =>
        repository.delete(doc.id)
      )
    );
  });

  describe("CRUD Operations", () => {
    test("should create a document", async () => {
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

    test("should retrieve a document by ID", async () => {
      const testData = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      };

      const created = await repository.create(testData);
      const retrieved = await repository.getById(created.id!);

      expect(retrieved).toEqual(created);
    });

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
  });

  describe("Soft Delete", () => {
    test("should soft delete a document by default", async () => {
      const doc = await repository.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
      });

      await repository.delete(doc.id!);

      // Should throw when trying to get soft-deleted document
      await expect(repository.getById(doc.id!)).rejects.toThrow(
        /Document with ID .* has been deleted/
      );

      // Verify document still exists with deletedAt timestamp
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

      await hardDeleteRepo.delete(doc.id!);

      // Verify document no longer exists
      const snapshot = await hardDeleteRepo.getDocumentSnapshot(doc.id!);
      expect(snapshot.exists).toBe(false);
    });

    test("should prevent updates to soft-deleted documents", async () => {
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

  describe("Pagination", () => {
    test("should apply filters in pagination", async () => {
      // Create test documents with specific status
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
        includeSoftDeleted: false
      };
  
      const result = await repository.paginate(options);
  
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(2); // Now this should pass as we're only counting active documents
      expect(result.data.every((doc: any) => doc.status === "active")).toBe(true);
    });
  });
});
