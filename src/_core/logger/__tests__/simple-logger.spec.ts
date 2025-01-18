import { mock, describe, it, expect, beforeEach } from "bun:test";
import { SimpleLogger } from "../simple-logger";
import type * as fs from "fs";

describe("SimpleLogger", () => {
    let logger: SimpleLogger;
    let consoleLogMock: ReturnType<typeof mock>;
    let mockFs: Pick<typeof fs, 'appendFileSync' | 'existsSync' | 'mkdirSync'>;

    beforeEach(() => {
        // Setup console.log mock
        consoleLogMock = mock(() => {});
        global.console.log = consoleLogMock;

        // Create fs mock object with only the methods we need
        mockFs = {
            appendFileSync: mock(() => {}) as unknown as typeof fs.appendFileSync,
            existsSync: mock(() => true) as unknown as typeof fs.existsSync,
            mkdirSync: mock(() => {}) as unknown as typeof fs.mkdirSync
        };

        // Create logger instance with mocked fs
        logger = new SimpleLogger(mockFs as typeof fs);
    });

    it("should write an info log message to the file and console", () => {
        // Call the info method with metadata
        const meta = { key: "value" };
        logger.info("Test info message", meta);

        // Get the expected log message format
        const expectedLogMessage = expect.stringContaining(`[INFO] Test info message ${JSON.stringify(meta)}`);

        // Verify console.log was called
        expect(consoleLogMock).toHaveBeenCalledWith(expectedLogMessage);

        // Verify file write was called
        expect(mockFs.appendFileSync).toHaveBeenCalledTimes(1);
        const appendFileSyncMock = mockFs.appendFileSync as ReturnType<typeof mock>;
        expect(appendFileSyncMock.mock.calls[0][1]).toInclude("[INFO] Test info message");
    });

    it("should write messages to the log file", () => {
        const meta = { key: "value" };
        const errorObj = new Error("Test error");
        
        // Test different log levels
        logger.info("Info message", meta);
        logger.error("Error message", errorObj);
        logger.warn("Warning message", meta);
        logger.debug("Debug message", meta);

        // Verify file writing was called for each log
        const appendFileSyncMock = mockFs.appendFileSync as ReturnType<typeof mock>;
        expect(appendFileSyncMock).toHaveBeenCalledTimes(4);
        
        // Verify format of each type of log
        const calls = appendFileSyncMock.mock.calls;
        
        expect(calls[0][1]).toInclude("[INFO] Info message");
        expect(calls[1][1]).toInclude("[ERROR] Error message");
        expect(calls[2][1]).toInclude("[WARN] Warning message");
        expect(calls[3][1]).toInclude("[DEBUG] Debug message");
    });

    it("should handle errors without metadata", () => {
        const errorObj = new Error("Test error");
        logger.error("Error message", errorObj);
    
        const appendFileSyncMock = mockFs.appendFileSync as ReturnType<typeof mock>;
        expect(appendFileSyncMock).toHaveBeenCalledTimes(1);
        
        // Get the actual log message
        const logMessage = appendFileSyncMock.mock.calls[0][1];
        
        // Test each part of the message
        expect(logMessage).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/); // Timestamp
        expect(logMessage).toInclude("[ERROR] Error message");
        
        // Check for the error format we're actually seeing
        const expectedErrorPart = '"error":"Error: Test error\\n    Error: Test error\\n    at <anonymous>';
        expect(logMessage).toInclude(expectedErrorPart);
    });
    

    it("should create log directory if it doesn't exist", () => {
        // Arrange
        mockFs.existsSync = mock(() => false); // Directory doesn't exist
    
        // Act
        const logger = new SimpleLogger(mockFs as typeof fs);
    
        // Assert
        expect(mockFs.mkdirSync).toHaveBeenCalledTimes(1);
        expect(mockFs.mkdirSync).toHaveBeenCalledWith(
            expect.stringContaining('logs'),
            { recursive: true }
        );
    });
});