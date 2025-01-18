import type { NextFunction, Request, Response, RequestHandler } from "express";
import type { CustomRequest } from "../helper/interfaces/CustomRequest.interface";

export const startTimeAddOnRequest: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  (req as CustomRequest).startTime = Date.now();
  (res as any).locals.startTime = (req as CustomRequest).startTime;
  next();
};