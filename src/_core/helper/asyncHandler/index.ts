import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { CustomRequest } from '../interfaces/CustomRequest.interface';
// First, define a type that extends RequestHandler for async functions
type AsyncRequestHandler = (
  req: Request | CustomRequest,
  res: Response,
  next: NextFunction
) => Promise<void | any>;

// The wrapper function needs to handle both sync and async handlers
export const asyncHandler = 
  (fn: RequestHandler | AsyncRequestHandler) => 
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
