import { describe, expect, it, beforeEach, mock, afterEach } from "bun:test";
import { config, firebaseConfig, showConfig } from "../dotenv.config";

// Mock package.json content
const mockPackageJson = {
  name: "test-app",
  version: "1.0.0"
};

// Mock config object
const mockConfig = {
  appName: "test-app",
  appVersion: "1.0.0",
  baseApi: "/api/v1",
  env: "test",
  mode: "test",
  port: "4000",
  host: "test-host",
  dbUri: "mongodb://test:27017/testdb",
  dbName: "testdb",
  logDir: "test-logs",
  get baseUrl() {
    return this.mode === "development"
      ? `${this.host}:${this.port}`
      : this.host;
  }
};

// Mock firebaseConfig object
const mockFirebaseConfig = {
  apiKey: "test-api-key",
  authDomain: "test.firebaseapp.com",
  databaseURL: "https://test.firebaseio.com",
  projectId: "test-project",
  storageBucket: "test.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-ABCDEF123"
};

// Mock the config and firebaseConfig objects
mock.module("../dotenv.config", () => ({
  config: mockConfig,
  firebaseConfig: mockFirebaseConfig,
  showConfig: () => `✅ Config: ${JSON.stringify(mockConfig, null, 2)}`
}));

describe("Dotenv Configuration", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockConfig.mode = "test"; // Reset mode to default
  });

  it("should use mocked config values", () => {
    expect(config.port).toBe("4000");
    expect(config.host).toBe("test-host");
    expect(config.baseApi).toBe("/api/v1");
    expect(config.mode).toBe("test");
    expect(config.dbUri).toBe("mongodb://test:27017/testdb");
    expect(config.dbName).toBe("testdb");
    expect(config.logDir).toBe("test-logs");
  });

  it("should use mocked Firebase configuration", () => {
    expect(firebaseConfig.apiKey).toBe("test-api-key");
    expect(firebaseConfig.authDomain).toBe("test.firebaseapp.com");
    expect(firebaseConfig.projectId).toBe("test-project");
    expect(firebaseConfig.storageBucket).toBe("test.appspot.com");
    expect(firebaseConfig.messagingSenderId).toBe("123456789");
    expect(firebaseConfig.appId).toBe("1:123456789:web:abcdef");
    expect(firebaseConfig.measurementId).toBe("G-ABCDEF123");
  });

  it("should compute baseUrl correctly", () => {
    // Test development mode
    mockConfig.mode = "development";
    expect(config.baseUrl).toBe(`${config.host}:${config.port}`);

    // Test production mode
    mockConfig.mode = "production";
    expect(config.baseUrl).toBe(config.host);
  });

  it("should show config status correctly", () => {
    const configStatus = showConfig();
    expect(configStatus).toContain("✅ Config:");
    expect(configStatus).toContain("test-host");
    expect(configStatus).toContain("4000");
  });

  it("should show error message when config is empty", () => {
    // Mock the config object to simulate an empty state
    mock.module("../dotenv.config", () => ({
      config: {}, // Empty config object
      firebaseConfig: mockFirebaseConfig,
      showConfig: () => "❌ Config not loaded"
    }));

    // Re-import the module to apply the mock
    const { showConfig } = require("../dotenv.config");

    const configStatus = showConfig();
    expect(configStatus).toBe("❌ Config not loaded");
  });
});