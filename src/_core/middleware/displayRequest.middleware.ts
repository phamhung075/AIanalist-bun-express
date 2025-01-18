import type { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash";
import {
  bgMagenta,
  bgWhite,
  blue,
  blueBright,
  greenBright,
  yellow,
} from "colorette";

export function displayRequest(
  req: Request,
  _: Response,
  next: NextFunction
): void {
  const timestamp = new Date().toLocaleString();
  console.log(bgWhite("\n" + "showRequest: " + timestamp));
  if (!isEmpty(req.originalUrl))
    console.log(
      "Request URL:",
      `${blueBright(req.headers.host ?? "host_not_found")}${blue(
        req.originalUrl
      )}`
    );
  if (!isEmpty(req.method)) console.log("Method:", yellow(req.method));
  if (!isEmpty(req.body))
    console.log("Body:", greenBright(JSON.stringify(req.body, null, 2)));
  if (!isEmpty(req.params))
    console.log("Params:", JSON.stringify(req.params, null, 2));
  if (!isEmpty(req.query))
    console.log("Query:", JSON.stringify(req.query, null, 2));
  console.log(bgMagenta("\n"));
  next();
}

export function getRequest(req: Request): string {
  const requestData = {
    timestamp: new Date().toLocaleString(),
    url:
      req.headers?.host && req.originalUrl
        ? `${req.headers.host}${req.originalUrl}`
        : undefined,
    method: !isEmpty(req.method) ? req.method : undefined,
    body: !isEmpty(req.body) ? req.body : undefined,
    params: !isEmpty(req.params) ? req.params : undefined,
    query: !isEmpty(req.query) ? req.query : undefined,
  };

  // Ensure all properties are explicitly included
  return JSON.stringify(
    {
      timestamp: requestData.timestamp,
      url: requestData.url || undefined,
      method: requestData.method || undefined,
      body: requestData.body || undefined,
      params: requestData.params || undefined,
      query: requestData.query || undefined,
    },
    null,
    2
  );
}
