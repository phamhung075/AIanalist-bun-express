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

describe("BaseRepository Error Handling and Advanced Pagination", () => {
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
    // Clean up the collection first
    const allDocs = await repository.getAll();
    await Promise.all(allDocs.map(doc => repository.delete(doc.id!)));
  });

  describe("pagination features", () => {
    test("should handle multiple filters and ordering", async () => {
      const timestamp = Date.now();
      await Promise.all([
        repository.create({
          name: `Active High ${timestamp}`,
          description: "Test description 1",
          priority: "high",
          status: "active"
        }),
        repository.create({
          name: `Active Low ${timestamp}`,
          description: "Test description 2",
          priority: "low",
          status: "active"
        }),
        repository.create({
          name: `Inactive ${timestamp}`,
          description: "Test description 3",
          priority: "low",
          status: "inactive"
        })
      ]);

      const result = await repository.paginator({
        page: 1,
        limit: 10,
        filters: [
          { key: "status", operator: "==", value: "active" },
          { key: "priority", operator: "==", value: "high" }
        ],
        orderBy: {
          field: "name",
          direction: "asc"
        }
      });

      expect(result.data.length).toBe(1);
      expect(result.count).toBe(1);
      expect(result.totalItems).toBeGreaterThanOrEqual(1);
      expect(result.page).toBe(1);
      expect(result.data[0].status).toBe("active");
      expect(result.data[0].priority).toBe("high");
    });

    test("should return all documents and handle metadata when all flag is true", async () => {
      // Create exactly 15 test documents
      const docsToCreate = Array(15).fill(null).map((_, index) => ({
        name: `Test ${String(index).padStart(2, '0')}`,
        description: faker.commerce.productDescription(),
        status: "active"
      }));

      await Promise.all(
        docsToCreate.map(doc => repository.create(doc))
      );

      const result = await repository.paginator({
        page: 1,
        limit: 5,
        all: true,
        orderBy: {
          field: "name",
          direction: "asc"
        }
      });

      // Check data retrieval
      expect(result.data.length).toBe(15); // Should get all documents
      expect(result.count).toBe(15);
      expect(result.totalItems).toBe(15);
      expect(result.data).toHaveLength(15);
      
      // Verify order
      const names = result.data.map(doc => doc.name);
      expect(names).toEqual([...names].sort());
      
      // Verify we got all documents
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(15);
      
      // Verify data consistency
      result.data.forEach(doc => {
        expect(doc.status).toBe("active");
        expect(doc.description).toBeDefined();
      });
    });

    test("should handle pagination with lastVisible", async () => {
      // Create test documents with consistent ordering
      const createdDocs = await Promise.all(
        Array(15).fill(null).map((_, index) => 
          repository.create({
            name: `Test ${String(index).padStart(2, '0')}`,
            description: faker.commerce.productDescription()
          })
        )
      );

      // Get first page
      const firstPage = await repository.paginator({
        page: 1,
        limit: 5,
        orderBy: {
          field: "name",
          direction: "asc"
        }
      });

      expect(firstPage.data.length).toBe(5);
      expect(firstPage.hasNext).toBe(true);

      // Get the raw document snapshot for lastVisible
      const lastDocSnapshot = await repository.getDocumentSnapshot(firstPage.data[4].id!);

      // Get second page using the document snapshot
      const secondPage = await repository.paginator({
        page: 2,
        limit: 5,
        orderBy: {
          field: "name",
          direction: "asc"
        },
        lastVisible: lastDocSnapshot
      });

      expect(secondPage.data.length).toBe(5);
      expect(secondPage.count).toBe(5);
      expect(secondPage.page).toBe(2);
      
      // Verify documents are different between pages
      const firstPageNames = new Set(firstPage.data.map(doc => doc.name));
      const secondPageNames = new Set(secondPage.data.map(doc => doc.name));
      const overlap = intersection(firstPageNames, secondPageNames);
      expect(overlap.size).toBe(0);
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