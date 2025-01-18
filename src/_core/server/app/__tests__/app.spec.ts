import 'reflect-metadata';
import { test, expect, beforeAll, afterAll, describe } from 'bun:test';
import { HttpStatusCode } from '@helper/http-status/common/HttpStatusCode';
import { appService } from '../app.service';
import type { Server } from 'http';

describe('AppService API Tests', () => {
  let server: ReturnType<typeof appService.listen>;
  let serverInstance: Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Set environment variables
    process.env.NODE_ENV = 'test';
    process.env.HTTPS = 'false'; // Ensure HTTPS is disabled for tests
  
    // Start the server on a random port
    server = appService.listen();
    serverInstance = await server;
  
    const address = serverInstance.address();
    if (address && typeof address !== 'string') {
      baseUrl = `http://localhost:${address.port}`;
    } else {
      baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    }
  
    console.log(`Server running at ${baseUrl}`);
  });

  test('should return 404 for an unknown route', async () => {
    const response = await fetch(`${baseUrl}/unknown-route`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
    const body = await response.json();
    
    expect(body).toMatchObject({
      success: false,
      code: HttpStatusCode.NOT_FOUND,
      message: 'The requested resource was not found.',
      metadata: expect.objectContaining({
        statusCode: 'NOT_FOUND',
        description: 'The server cannot find the requested resource.'
      })
    });
  });

  test('should return 200 for a valid health check route', async () => {
    const response = await fetch(`${baseUrl}/health`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    expect(response.status).toBe(HttpStatusCode.OK);
    const body = await response.json();
    
    expect(body).toMatchObject({
      status: 'ok'
    });
  });

  test('should handle preflight CORS request', async () => {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    expect(response.status).toBe(HttpStatusCode.NO_CONTENT);
    // Check all required CORS headers
    expect(response.headers.get('access-control-allow-methods')).toBeDefined();
    expect(response.headers.get('access-control-allow-headers')).toBeDefined();
  });

  test('should handle JSON bodies', async () => {
    const testData = { test: true };

    const response = await fetch(`${baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    expect(response.status).toBe(HttpStatusCode.OK);
    const body = await response.json();
    
    expect(body).toMatchObject({
      message: expect.any(String)
    });
  });

  afterAll(async () => {
    // Clean shutdown
    if (serverInstance) {
      await new Promise<void>((resolve) => {
        serverInstance.close(() => {
          resolve();
        });
      });
    }

    // Small delay to ensure all connections are closed
    await new Promise(resolve => setTimeout(resolve, 100));
  });
});