import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../helper/http-status/common/HttpStatusCode';
import _ERROR from '../helper/http-status/error/index';
import { logResponse } from '../helper/http-status/response-log';

// Not Found Handler Middleware
export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next(new _ERROR.NotFoundError({
    message: 'The requested resource was not found.',
    status: HttpStatusCode.NOT_FOUND
  }));
};

// Error Handler Middleware
export const errorHandlerMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error(error)
  logResponse(req, JSON.stringify(error, null, 2));

  // Already sent response
  if (res.headersSent) {
    return next(error);
  }

  // Get error status and message
  const status = error.status || HttpStatusCode.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Internal Server Error';
  console.log('errorHandlerMiddleware', status);
  // Create appropriate error instance
  let errorResponse;
  if (error instanceof _ERROR.ErrorResponse) {
    errorResponse = error;
  } else if (status === HttpStatusCode.NOT_FOUND) {
    errorResponse = new _ERROR.NotFoundError({ message });
  } else {
    errorResponse = new _ERROR.InternalServerError({ message });
  }

  // Send error response
  return errorResponse.send(res);
};

// Export both middlewares
export const errorMiddleware = {
  notFound: notFoundMiddleware,
  errorHandler: errorHandlerMiddleware
};