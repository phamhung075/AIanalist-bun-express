// import { describe, expect, it, beforeEach, mock } from "bun:test";
// import type { Request, Response, NextFunction } from "express";

// type MockedNextFunction = ReturnType<typeof mock> & NextFunction;
// type MockFunction = ReturnType<typeof mock>;

// interface MockedResponse extends Omit<Response, 'status' | 'json'> {
//   status: MockFunction & ((code: number) => MockedResponse);
//   json: MockFunction & ((body: any) => MockedResponse);
// }

// // Mock firebase-admin before importing the middleware
// const mockVerifyIdToken = mock(async (token: string) => {
//   if (token === "valid_token") {
//     return { uid: "user123" };
//   }
//   throw new Error("Invalid token");
// });

// // Mock modules before importing the middleware
// mock.module("firebase-admin", () => ({
//   __esModule: true,
//   default: {
//     apps: [],
//     initializeApp: () => {},
//     auth: () => ({
//       verifyIdToken: mockVerifyIdToken
//     })
//   }
// }));

// mock.module("@helper/http-status/common/HttpStatusCode", () => ({
//   UNAUTHORIZED: 401
// }));

// mock.module("@helper/http-status/common/RestHandler", () => ({
//   error: (req: Request, res: Response, error: { code: number; message: string }) => {
//     return res.status(error.code).json({
//       success: false,
//       code: error.code,
//       message: error.message,
//       errors: undefined,
//       metadata: {
//         statusCode: "UNAUTHORIZED",
//         description: "The client must authenticate itself to get the requested response.",
//         documentation: "https://tools.ietf.org/html/rfc7235#section-3.1",
//         timestamp: new Date().toISOString()
//       }
//     });
//   }
// }));

// // Import the middleware after all mocks are set up
// import { firebaseAuthMiddleware } from "../auth.middleware";

// describe("firebaseAuthMiddleware", () => {
//   let req: Partial<Request>;
//   let res: MockedResponse;
//   let next: MockedNextFunction;

//   beforeEach(() => {
//     // Reset mocks
//     mockVerifyIdToken.mockReset();

//     // Setup request
//     req = {
//       headers: {}
//     };

//     // Setup mocked response with chainable methods
//     const mockStatus = mock(() => mockRes);
//     const mockJson = mock(() => mockRes);
//     const mockRes: MockedResponse = {
//       status: mockStatus as any,
//       json: mockJson as any
//     } as unknown as MockedResponse;
//     res = mockRes;

//     // Setup next
//     next = mock(() => {}) as MockedNextFunction;
//   });

//   it("should return 401 if no token is provided", async () => {
//     await firebaseAuthMiddleware(req as Request, res as unknown as Response, next);
    
//     expect(res.status.mock.calls).toHaveLength(1);
//     expect(res.status.mock.calls[0][0]).toBe(401);
//     expect(res.json.mock.calls).toHaveLength(1);
//     expect(res.json.mock.calls[0][0]).toMatchObject({
//       success: false,
//       code: 401,
//       message: "Unauthorized: No token provided"
//     });
//   });

//   it("should return 401 if token is invalid", async () => {
//     req.headers = { authorization: "Bearer invalid_token" };
    
//     await firebaseAuthMiddleware(req as Request, res as unknown as Response, next);
    
//     expect(res.status.mock.calls).toHaveLength(1);
//     expect(res.status.mock.calls[0][0]).toBe(401);
//     expect(res.json.mock.calls).toHaveLength(1);
//     expect(res.json.mock.calls[0][0]).toMatchObject({
//       success: false,
//       code: 401,
//       message: "Unauthorized: Invalid or expired token"
//     });
//     expect(next.mock.calls).toHaveLength(0);
//   });

//   it("devrait appeler next() si le token est valide", async () => {
//     req.headers = { authorization: "Bearer valid_token" };
    
//     await firebaseAuthMiddleware(req as Request, res as unknown as Response, next);
    
//     expect(mockVerifyIdToken.mock.calls).toHaveLength(1);
//     expect(mockVerifyIdToken.mock.calls[0][0]).toBe("valid_token");
//     expect((req as any).user).toEqual({ uid: "user123" });
//     expect(next.mock.calls).toHaveLength(1);
//     expect(res.status.mock.calls).toHaveLength(0);
//     expect(res.json.mock.calls).toHaveLength(0);
//   });
// });