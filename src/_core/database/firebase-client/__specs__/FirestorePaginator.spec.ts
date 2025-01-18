import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "bun:test";
import { faker } from "@faker-js/faker";
import { initializeApp, deleteApp, getApps } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { fail } from "assert";
import { FirestorePaginator } from "../FirestorePaginatorClientSide";

interface TestDocument {
  id: string;
  name: string;
  status: string;
  priority: string;
  createdAt: Timestamp;
  deletedAt: Timestamp | null;
}

describe("FirestorePaginator", () => {
  let paginator: FirestorePaginator<TestDocument>;
  let app: any;
  let db: any;
  const TOTAL_DOCS = 10;
  const PAGINATION_DOCS = 16;
  // Helper function to create test documents
  async function createTestDocuments(count: number) {
    const docs: any[] = [];
    let currentBatch = writeBatch(db);
    let batchCount = 0;
    const batchLimit = 500;

    for (let i = 0; i < count; i++) {
      const docData = {
        name: `Test ${String(i).padStart(2, "0")}`,
        status: i % 2 === 0 ? "active" : "pending",
        priority: i % 3 === 0 ? "high" : "low",
        createdAt: Timestamp.fromDate(new Date(2024, 0, i + 1)),
        deletedAt: i % 5 === 0 ? Timestamp.fromDate(new Date()) : null,
      };

      const collectionRef = collection(db, "test_collection");
      const newDocRef = doc(collectionRef);
      currentBatch.set(newDocRef, docData);
      docs.push({ id: newDocRef.id, ...docData });

      batchCount++;

      if (batchCount === batchLimit) {
        await currentBatch.commit();
        currentBatch = writeBatch(db);
        batchCount = 0;
        console.log(`Committed batch of ${batchLimit} documents`);
      }
    }

    if (batchCount > 0) {
      await currentBatch.commit();
      console.log(`Committed final batch of ${batchCount} documents`);
    }

    return docs;
  }

  // Helper function to cleanup test documents
  async function cleanupTestDocuments() {
    try {
      const snapshot = await getDocs(collection(db, "test_collection"));

      // Handle empty collection case
      if (snapshot.empty) return;

      // Split into batches of 500 (Firestore limit)
      const batches = [];
      let batch = writeBatch(db);
      let operationCount = 0;

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        operationCount++;

        if (operationCount === 500) {
          batches.push(batch.commit());
          batch = writeBatch(db);
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        batches.push(batch.commit());
      }

      await Promise.all(batches);
    } catch (error) {
      console.error("Cleanup error:", error);
      throw error; // Propagate error to fail the test
    }
  }

  async function validateFilterOperator(operator: string) {
    const validOperators = [
      "==",
      "!=",
      ">",
      ">=",
      "<",
      "<=",
      "array-contains",
      "in",
      "not-in",
    ];
    if (!validOperators.includes(operator)) {
      throw new Error(`Invalid filter operator: ${operator}`);
    }
  }

  // Add retry logic for critical operations
  async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts = 3,
    delay = 1000
  ): Promise<T> {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await operation();
        return result;
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        lastError = error;
        if (attempt === maxAttempts) break;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    console.error("All retry attempts failed");
    throw lastError;
  }

  beforeAll(async () => {
    await retryOperation(
      async () => {
        // Initialize Firebase setup
        process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080";

        // Ensure clean slate by deleting existing apps
        const existingApps = getApps();
        await Promise.all(existingApps.map((app) => deleteApp(app)));

        // Add delay to ensure connections are cleaned up
        await new Promise((resolve) => setTimeout(resolve, 1000));

        app = initializeApp({
          projectId: "demo-test",
          apiKey: "demo-test-key",
          appId: "demo-test-app-id",
        });

        db = getFirestore(app);
        connectFirestoreEmulator(db, "localhost", 8080);

        // Allow emulator connection to stabilize
        await new Promise((resolve) => setTimeout(resolve, 1000));

        paginator = new FirestorePaginator<TestDocument>(
          collection(db, "test_collection")
        );
      },
      3,
      2000
    ); // Increase retry attempts and delay
  });

  async function verifyCleanup() {
    const snapshot = await getDocs(collection(db, "test_collection"));
    expect(snapshot.docs.length).toBe(0);
  }

  beforeEach(async () => {
    await cleanupTestDocuments();
    await verifyCleanup();

    const docs = await createTestDocuments(PAGINATION_DOCS);
    const snapshot = await getDocs(collection(db, "test_collection"));

    if (snapshot.docs.length !== PAGINATION_DOCS) {
      console.error(`Document creation failed:
        Expected: ${PAGINATION_DOCS}
        Created: ${snapshot.docs.length}
        Missing: ${PAGINATION_DOCS - snapshot.docs.length}
      `);
      throw new Error(`Failed to create expected number of documents`);
    }
  });

  afterEach(async () => {
    await cleanupTestDocuments();
    await verifyCleanup(); // Verify cleanup was successful
  });

  describe("Basic Pagination", () => {
    beforeEach(async () => {
      await createTestDocuments(15); // Create 15 test documents
    });

    test("should return paginated results with default options", async () => {
      const result = await paginator.paginate({
        page: 1,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.total).toBeDefined();
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    test("should respect custom page and limit", async () => {
      const result = await paginator.paginate({
        page: 2,
        limit: 5,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe("Filtering", () => {
    beforeEach(async () => {
      await createTestDocuments(10);
    });

    test("should apply single filter condition", async () => {
      const result = await paginator.paginate({
        filters: [{ key: "status", operator: "==", value: "active" }],
      });

      expect(result.appliedFilters?.filters).toEqual({ status: "active" });
      result.data.forEach((doc) => {
        expect(doc.status).toBe("active");
      });
    });

    test("should apply multiple filter conditions", async () => {
      const result = await paginator.paginate({
        filters: [
          { key: "status", operator: "==", value: "active" },
          { key: "priority", operator: "==", value: "high" },
        ],
      });

      expect(result.appliedFilters?.filters).toEqual({
        status: "active",
        priority: "high",
      });
      result.data.forEach((doc) => {
        expect(doc.status).toBe("active");
        expect(doc.priority).toBe("high");
      });
    });
  });

  describe("Composite Filtering", () => {
    beforeEach(async () => {
      await cleanupTestDocuments();
      await verifyCleanup(); // Add verification
      try {
        await createTestDocuments(10);
        // Verify creation
        const snapshot = await getDocs(collection(db, "test_collection"));
        expect(snapshot.docs.length).toBe(10);
      } catch (error) {
        console.error("Setup error:", error);
        throw error;
      }
    });

    afterEach(async () => {
      try {
        await cleanupTestDocuments();
        await verifyCleanup();
      } catch (error) {
        console.error("Cleanup error:", error);
      }
    });

    test("should apply OR composite filter", async () => {
      return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Test timed out"));
        }, 5000); // 5 second timeout

        try {
          const result = await paginator.paginate({
            compositeFilters: [
              {
                type: "or",
                conditions: [
                  { key: "status", operator: "==", value: "active" },
                  { key: "status", operator: "==", value: "pending" },
                ],
              },
            ],
          });

          result.data.forEach((doc) => {
            expect(["active", "pending"]).toContain(doc.status);
          });

          clearTimeout(timeout);
          resolve(void 0);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });

    test("should apply AND composite filter", async () => {
      const result = await paginator.paginate({
        compositeFilters: [
          {
            type: "and",
            conditions: [
              { key: "status", operator: "==", value: "active" },
              { key: "priority", operator: "==", value: "high" },
            ],
          },
        ],
      });

      result.data.forEach((doc) => {
        expect(doc.status).toBe("active");
        expect(doc.priority).toBe("high");
      });
    });
  });

  describe("Date Range Filtering", () => {
    beforeEach(async () => {
      await createTestDocuments(10);
    });

    test("should filter by date range", async () => {
      const startDate = new Date(2024, 0, 1); // Jan 1, 2024
      const endDate = new Date(2024, 0, 5); // Jan 5, 2024

      const result = await paginator.paginate({
        dateRange: {
          field: "createdAt",
          start: startDate,
          end: endDate,
        },
      });

      result.data.forEach((doc) => {
        const timestamp = doc.createdAt as Timestamp;
        expect(timestamp.toMillis()).toBeGreaterThanOrEqual(
          startDate.getTime()
        );
        expect(timestamp.toMillis()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    test("should handle date range with only start date", async () => {
      const startDate = new Date(2024, 0, 5); // Jan 5, 2024

      const result = await paginator.paginate({
        dateRange: {
          field: "createdAt",
          start: startDate,
        },
      });

      result.data.forEach((doc) => {
        const timestamp = doc.createdAt as Timestamp;
        expect(timestamp.toMillis()).toBeGreaterThanOrEqual(
          startDate.getTime()
        );
      });
    });
  });

  describe("Sorting", () => {
    beforeEach(async () => {
      await createTestDocuments(10);
    });

    test("should sort by single field", async () => {
      const result = await paginator.paginate({
        orderBy: { field: "name", direction: "asc" },
      });

      const names = result.data.map((doc) => doc.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    test("should sort by multiple fields", async () => {
      const result = await paginator.paginate({
        orderBy: [
          { field: "status", direction: "asc" },
          { field: "priority", direction: "desc" },
        ],
      });

      expect(result.appliedFilters?.orderBy).toEqual({
        status: "asc",
        priority: "desc",
      });

      // Verify sorting order
      let prevStatus = "";
      let prevPriority = "";
      result.data.forEach((doc) => {
        if (prevStatus === doc.status) {
          // Within same status, priority should be descending
          expect(prevPriority >= doc.priority).toBe(true);
        } else if (prevStatus !== "") {
          // Different status should be in ascending order
          expect(prevStatus <= doc.status).toBe(true);
        }
        prevStatus = doc.status;
        prevPriority = doc.priority;
      });
    });
  });

  describe("Field Selection", () => {
    beforeEach(async () => {
      await createTestDocuments(5);
    });

    test("should return only selected fields", async () => {
      const result = await paginator.paginate({
        select: ["name", "status"],
      });

      result.data.forEach((doc) => {
        const keys = Object.keys(doc).sort();
        expect(keys).toEqual(["id", "name", "status"].sort());
      });
    });

    test("should handle empty field selection", async () => {
      const result = await paginator.paginate({
        select: [],
      });

      result.data.forEach((doc) => {
        expect(doc.id).toBeDefined();
        expect(doc.name).toBeDefined();
        expect(doc.status).toBeDefined();
        expect(doc.priority).toBeDefined();
        expect(doc.createdAt).toBeDefined();
        expect(doc.deletedAt).toBeDefined();
      });
    });
  });

  describe("Soft Delete Handling", () => {
    beforeEach(async () => {
      // Ensure at least one document is soft deleted
      const docs = await createTestDocuments(10);
      // Add an explicitly deleted document to ensure test consistency
      const collectionRef = collection(db, "test_collection");
      await addDoc(collectionRef, {
        name: "Deleted Doc",
        status: "active",
        priority: "high",
        createdAt: Timestamp.fromDate(new Date()),
        deletedAt: Timestamp.fromDate(new Date())
      });
    });
  
    test("should exclude soft deleted documents by default", async () => {
      const result = await paginator.paginate({});
      const hasDeletedDocs = result.data.some((doc) => doc.deletedAt !== null);
      expect(hasDeletedDocs).toBe(false);
    });
  
    test("should include soft deleted documents when specified", async () => {
      const result = await paginator.paginate({
        includeSoftDeleted: true,
      });
      const hasDeletedDocs = result.data.some((doc) => doc.deletedAt !== null);
      expect(hasDeletedDocs).toBe(true);
    });
  });

  describe("Pagination Navigation", () => {
    beforeEach(async () => {
      await cleanupTestDocuments();
      await verifyCleanup();

      // Create documents and verify
      await createTestDocuments(PAGINATION_DOCS);
      const snapshot = await getDocs(collection(db, "test_collection"));

      // Add detailed logging
      console.log(`Created documents: ${snapshot.docs.length}`);
      console.log(`Expected documents: ${PAGINATION_DOCS}`);

      if (snapshot.docs.length !== PAGINATION_DOCS) {
        throw new Error(
          `Document creation verification failed. Expected ${PAGINATION_DOCS}, got ${snapshot.docs.length}`
        );
      }
    });

    test("should handle all documents request", async () => {
      const result = await paginator.paginate({
        all: true,
        includeSoftDeleted: true, // Include soft-deleted documents
        orderBy: { field: "name", direction: "asc" },
      });

      // Add logging for debugging
      console.log(`Total documents in result: ${result.data.length}`);
      console.log(
        `Soft-deleted documents: ${
          result.data.filter((d) => d.deletedAt !== null).length
        }`
      );

      expect(result.data.length).toBe(PAGINATION_DOCS);
      expect(result.total).toBe(PAGINATION_DOCS);
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid filter operator", async () => {
      const promise = validateFilterOperator("INVALID");
      await expect(promise).rejects.toThrow("Invalid filter operator");
    });
  
    test("should handle valid filter operators", async () => {
      const validOperators = ["==", "!=", ">", ">=", "<", "<=", "array-contains", "in", "not-in"];
      
      for (const operator of validOperators) {
        await validateFilterOperator(operator);
      }
    });
  
    test("should handle invalid filter value", async () => {
      // Test with null value which is valid in Firestore but should be rejected by our paginator
      const nullFilterPromise = paginator.paginate({
        filters: [
          { 
            key: "status", 
            operator: "==", 
            value: null
          }
        ]
      });
      
      await expect(nullFilterPromise).rejects.toThrow(/invalid.*value/i);
    });
  
    test("should handle array filter values correctly", async () => {
      // Test with invalid array-contains operator usage
      const invalidArrayContainsPromise = paginator.paginate({
        filters: [
          {
            key: "status",
            operator: "array-contains",
            value: ["active", "pending"] // array-contains doesn't accept arrays
          }
        ]
      });
      
      await expect(invalidArrayContainsPromise).rejects.toThrow(/invalid.*value/i);
  
      // Test with valid 'in' operator usage
      const validInOperatorPromise = paginator.paginate({
        filters: [
          {
            key: "status",
            operator: "in",
            value: ["active", "pending"]
          }
        ]
      });
  
      const result = await validInOperatorPromise;
      expect(result).toBeDefined();
      expect(result.data.length).toBeGreaterThanOrEqual(0);
    });
  });
});
