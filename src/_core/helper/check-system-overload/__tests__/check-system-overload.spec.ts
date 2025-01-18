import { describe, test, expect, beforeEach, afterAll, mock, spyOn } from "bun:test";
import os from 'os';
import process from 'process';
import { checkSystemOverload } from '../check-system-overload';
import { database } from '@database/firebase-admin-sdk';

// Mock system modules and Firebase
mock.module('os', () => ({
  cpus: () => [],  // Will be overridden in tests
}));

mock.module('@/core/database/firebase-admin-sdk', () => ({
  database: {
    ref: () => ({
      once: () => Promise.resolve(null),
    }),
  },
}));

describe('checkSystemOverload', () => {
  const consoleLogSpy = spyOn(console, 'log');
  const consoleErrorSpy = spyOn(console, 'error');

  // Mock timers
  const originalSetInterval = global.setInterval;
  let intervals: Function[] = [];

  beforeEach(() => {
    // Reset spies
    consoleLogSpy.mockReset();
    consoleErrorSpy.mockReset();

    // Reset intervals
    intervals = [];
    
    // Mock setInterval
    global.setInterval = ((fn: Function) => {
      intervals.push(fn);
      return 1;
    }) as any;

    // Mock process.memoryUsage with proper types
    const mockMemoryUsage = () => ({
      rss: 500000000, // ~500 MB
      heapTotal: 0,
      heapUsed: 0,
      external: 0,
      arrayBuffers: 0,
      buffer: 0
    }) as NodeJS.MemoryUsage;

    spyOn(process, 'memoryUsage').mockImplementation(mockMemoryUsage as NodeJS.MemoryUsageFn);
  });

  afterAll(() => {
    // Restore original setInterval
    global.setInterval = originalSetInterval;
  });

  // Helper to run intervals and wait for promises
  const runIntervals = async () => {
    for (const interval of intervals) {
      await interval();
    }
  };

  test('should log system resource usage', async () => {
    // Mock CPU cores
    os.cpus = () => Array(4).fill({}) as os.CpuInfo[]; // 4 cores

    // Mock database usage
    database.ref = () => ({
      once: () => Promise.resolve({
        numChildren: () => 10,
      }),
    }) as any;

    // Call the function
    checkSystemOverload();

    // Run intervals and wait for promises
    await runIntervals();

    // Validate logs
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Memory usage :: 476.837158203125 MB'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('maxConnections accept :: 20'));
    expect(consoleLogSpy).toHaveBeenCalledWith('Admin SDK does not directly monitor connection status.');
    expect(consoleLogSpy).toHaveBeenCalledWith('Number of documents (children) in Realtime Database: 10');
  });

  test('should handle database errors gracefully', async () => {
    // Mock CPU cores
    os.cpus = () => Array(3).fill({}) as os.CpuInfo[]; // 3 cores

    // Mock database error
    mock.module('@database/firebase-admin-sdk', () => ({
      database: {
        ref: () => ({
          once: () => Promise.resolve(null),
        }),
      },
    }));

    // Call the function
    checkSystemOverload();

    // Run intervals and wait for promises
    await runIntervals();

    // Validate logs
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Memory usage :: 476.837158203125 MB'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('maxConnections accept :: 15'));
    expect(consoleLogSpy).toHaveBeenCalledWith('Admin SDK does not directly monitor connection status.');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Error accessing Realtime Database:',
      expect.any(Error)
    );
  });
});