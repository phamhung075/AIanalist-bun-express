import type { NextFunction, Request, Response } from "express";

export const responseLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalSend = res.send;

  (res.send as any) = (body: any) => {
    console.log("[Response Logger]");
    console.log("➡️ URL:", req.originalUrl);
    console.log("➡️ Method:", req.method);
    console.log("➡️ Status Code:", res.statusCode);
    console.log("➡️ Response Body:", JSON.parse(body));

    return originalSend.call(res, body); // Explicitly call with 'res'
  };

  next();
};
