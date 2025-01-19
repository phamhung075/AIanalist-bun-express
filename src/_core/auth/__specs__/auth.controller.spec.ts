import { describe, test, expect, beforeEach, mock } from "bun:test";
import { faker } from "@faker-js/faker";
import { Response } from "express";
import { CustomRequest } from "@/_core/helper/interfaces/CustomRequest.interface";
import _ERROR from "@/_core/helper/http-status/error";
import AuthController from "../auth.controller";

describe("AuthController", () => {
  let controller: AuthController;
  let mockAuthService: any;
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let next: any;

  beforeEach(() => {
    mockAuthService = {
      register: mock(() => Promise.resolve()),
      login: mock(() => Promise.resolve()),
      refreshToken: mock(() => Promise.resolve()),
      getCurrentUser: mock(() => Promise.resolve()),
    };

    // Create mock response with common methods
    res = {
      status: mock((code: number) => res),
      json: mock((data: any) => res),
      cookie: mock((name: string, value: string, options?: any) => res),
      get: mock((header: string) => null),
      locals: { startTime: Date.now() },
      headersSent: false,
    } as any;

    // Updated request mock with get method
    req = {
      body: {},
      cookies: {},
      headers: {},
      user: undefined,
      startTime: Date.now(),
      get: mock((header: string): string | undefined => {
        if (header === "host") {
          return "test.example.com";
        }
        if (header === "set-cookie") {
          return undefined;
        }
        return undefined;
      }),
    } as any;

    next = mock();
    controller = new AuthController(mockAuthService as any);
  });

  describe("register", () => {
    test("should register user successfully", async () => {
      const registerData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        country: faker.location.country(),
      };

      const mockResult = {
        user: {
          uid: faker.string.uuid(),
          email: registerData.email,
        },
      };

      req.body = registerData;
      mockAuthService.register.mockResolvedValue(mockResult);

      await controller.register(req as CustomRequest, res as Response, next);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerData);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User registered successfully",
          data: mockResult,
        })
      );
    });

    test("should handle registration error", async () => {
      const registerData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      };

      req.body = registerData;
      mockAuthService.register.mockRejectedValue(
        new Error("Registration failed")
      );

      await expect(
        controller.register(req as CustomRequest, res as Response, next)
      ).rejects.toThrow("Registration failed");
    });
  });

  describe('login', () => {
    test('should login user successfully and set cookies', async () => {
      const loginData = {
        email: faker.internet.email(),
        password: faker.internet.password()
      };

      const mockResult = {
        idToken: 'mock-id-token',
        refreshToken: 'mock-refresh-token'
      };

      req.body = loginData;
      mockAuthService.login.mockResolvedValue(mockResult);

      await controller.login(req as CustomRequest, res as Response, next);

      // Verify service call
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData.email, loginData.password);

      // Verify cookies were set
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenCalledWith(
        'idToken',
        mockResult.idToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,  // Because NODE_ENV is not production in tests
          sameSite: 'lax' // Because NODE_ENV is not production in tests
        })
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        mockResult.refreshToken,
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax'
        })
      );

      // Verify response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User logged in successfully'
        })
      );
    });

    test("should handle login error", async () => {
      const loginData = {
        email: faker.internet.email(),
        password: faker.internet.password(),
      };

      req.body = loginData;
      mockAuthService.login.mockRejectedValue(new Error("Login failed"));

      await expect(
        controller.login(req as CustomRequest, res as Response, next)
      ).rejects.toThrow("Login failed");
    });
  });

  describe("getCurrentUser", () => {
    test("should return current user details", async () => {
      const mockUser = {
        uid: faker.string.uuid(),
        email: faker.internet.email(),
        aud: "test-audience",
        auth_time: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        iss: "https://securetoken.google.com/test-project",
        sub: faker.string.uuid(),
        firebase: {
          identities: {},
          sign_in_provider: "password",
        },
      };

      req.user = mockUser;

      await controller.getCurrentUser(
        req as CustomRequest,
        res as Response,
        next
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User fetched successfully",
          data: mockUser,
        })
      );
    });

    test("should handle unauthorized access", async () => {
      req.user = undefined;

      await expect(
        controller.getCurrentUser(req as CustomRequest, res as Response, next)
      ).rejects.toThrow(_ERROR.UnauthorizedError);
    });
  });

  describe("refreshToken", () => {
    test("should refresh token successfully", async () => {
      const mockTokens = {
        idToken: "new-id-token",
        refreshToken: "new-refresh-token",
      };

      req.headers = {
        cookie: "refreshToken=old-refresh-token",
      };

      mockAuthService.refreshToken.mockResolvedValue(mockTokens);

      await controller.refreshToken(
        req as CustomRequest,
        res as Response,
        next
      );

      // Verify service call
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
        "old-refresh-token"
      );

      // Verify new cookie was set
      expect(res.cookie).toHaveBeenCalledWith(
        "idToken",
        mockTokens.idToken,
        expect.objectContaining({
          httpOnly: true,
          maxAge: 3600 * 1000,
        })
      );

      // Verify response
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Token refreshed successfully",
          data: mockTokens,
        })
      );
    });

    test("should handle refresh token error", async () => {
      req.headers = {
        cookie: "refreshToken=invalid-token",
      };

      mockAuthService.refreshToken.mockRejectedValue(
        new Error("Token refresh failed")
      );

      await expect(
        controller.refreshToken(req as CustomRequest, res as Response, next)
      ).rejects.toThrow("Token refresh failed");
    });
  });
});
