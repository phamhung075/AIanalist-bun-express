import { ZodSchema, ZodError } from "zod";
import { HttpStatusCode } from "../http-status/common/HttpStatusCode";
import _ERROR, { ErrorResponse } from "../http-status/error/index";
import type { NextFunction, Request, Response } from "express";

/**
 * Middleware for validating request data with Zod schema
 * @param schema ZodSchema for validation
 * @param type 'body' | 'params' | 'query'
 */
export function validateDTO(schema: ZodSchema, type: 'body' | 'params' | 'query' = 'body') {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const dataToValidate = {
                body: req.body,
                params: req.params,
                query: req.query,
            }[type]; // Dynamically pick the validation target

            schema.parse(dataToValidate); // Validate the selected data
            next(); // Proceed to the next middleware/controller if valid
            
        } catch (err) {
            if (err instanceof ZodError) {
                throw new _ERROR.ValidationError({
                    message: 'Validation Error',
                    errors: err.issues.map((issue) => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    }))
                });
            }
            
            throw err; // Re-throw other types of errors
        }
    };
}