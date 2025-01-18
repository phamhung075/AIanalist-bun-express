import type { NextFunction, Response } from "express";
import { HttpStatusCode } from "../common/HttpStatusCode";
import { StatusCodes } from "../common/StatusCodes";
import { getStatusText } from "../common/api-config";


export class ErrorResponse  {
    success: boolean;
    message: string;
    error?: any;
    status: HttpStatusCode;
    metadata: any;
    options: any;
    errors?: Array<{ field: string; message: string; code?: string }>;

    constructor({
        message,
        status,
        reasonPhrase,
        metadata = {},
        errors,
        options = {},
    }: {
        message?: string;
        status?: HttpStatusCode;
        reasonPhrase?: string;
        metadata?: any;
        errors?: Array<{ field: string; message: string; code?: string }>;
        options?: any;
    }) {
        this.success = false;
        this.message = message || StatusCodes[status || HttpStatusCode.INTERNAL_SERVER_ERROR]?.phrase;
        this.error = true;
        this.status = status || HttpStatusCode.INTERNAL_SERVER_ERROR;
        this.errors = errors;
        this.metadata = this.formatMetadata(metadata);
        this.options = options;

        console.log('ErrorResponse', this.status);
    }

    private formatMetadata(metadata: any) {
        const description = StatusCodes[this.status]?.description;
        const documentation = StatusCodes[this.status]?.documentation;
        return {
            description,
            documentation,
            ...metadata,
        };
    }

    setStatus(status: number) {
        this.status = status;
        this.metadata.code = status;
        this.metadata.status = getStatusText(status);
        return this;
    }

    setMessage(message: string) {
        this.message = message;
        return this;
    }

    setMetadata(metadata: any) {
        this.metadata = { ...this.metadata, ...metadata };
        return this;
    }

    setOptions(options: any) {
        this.options = options;
        return this;
    }

    setResponseTime(startTime?: number) {
        const responseTime = startTime ? `${Date.now() - startTime}ms` : '0ms';
        this.metadata.responseTime = responseTime;
        return this;
    }

    setHeader(headers: Record<string, string>) {
        this.options.headers = { ...this.options.headers, ...headers };
        return this;
    }

    setError(error: any) {
        this.error = error;
        return this;
    }

    send(res: Response, next?: NextFunction) {
        try {
            this.preSendHooks();

            // Set Response Time if startTime exists on res.locals
            if (res.locals?.startTime) {
                this.setResponseTime(res.locals.startTime);
            }

            this.handleHeaders(res);

            if (!res.headersSent) {
                const response = this.formatResponse();
                // console.log('Sending ErrorResponse:', response);
                res.status(this.status).json(response);
            } else {
                console.warn('Attempted to send response after headers were already sent.');
            }

            this.postSendHooks();
        } catch (error) {
            console.error('Error sending response:', error);
            if (next) {
                next(error);
            } else {
                throw error;
            }
        }
    }

    private preSendHooks() {
        this.metadata.timestamp = new Date().toISOString();
    }

    private handleHeaders(res: Response) {
        if (this.options?.headers) {
            let cookieHeaders: string[] = [];
            
            Object.entries(this.options.headers).forEach(([key, value]) => {
                const normalizedKey = this.normalizeHeaderKey(key);
                
                if (normalizedKey === 'set-cookie') {
                    if (Array.isArray(value)) {
                        cookieHeaders.push(...value);
                    } else {
                        cookieHeaders.push(value as string);
                    }
                } else {
                    res.setHeader(key, value as any);
                }
            });
            
            if (cookieHeaders.length > 0) {
                res.setHeader('Set-Cookie', cookieHeaders);
            }
        }
    }

    private normalizeHeaderKey(key: string): string {
        return key.toLowerCase();
    }

    private formatResponse() {
        return {
            success: this.success,
            message: this.message,
            error: this.error,
            metadata: {
                ...this.metadata,
                code: this.status,
                status: getStatusText(this.status),
            },
            errors: this.errors,
        };
    }

    private postSendHooks() {
        console.error(`Error response sent with status: ${this.status}`);
    }
}


class BadRequestError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.BAD_REQUEST,
        });
    }
}

class UnauthorizedError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.UNAUTHORIZED,
        });
    }
}

class ForbiddenError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.FORBIDDEN,
        });
    }
}

class NotFoundError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.NOT_FOUND,
        });
        console.log('NotFoundError', params.status);
    }
}

class ConflictError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.CONFLICT,
        });
    }
}

class UnprocessableEntityError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.UNPROCESSABLE_ENTITY,
        });
    }
}


class InternalServerError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.INTERNAL_SERVER_ERROR,
        });
    }
}

class NotImplementedError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.NOT_IMPLEMENTED,
        });
    }
}

class BadGatewayError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.BAD_GATEWAY,
        });
    }
}

class ServiceUnavailableError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.SERVICE_UNAVAILABLE,
        });
    }
}

class GatewayTimeoutError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.GATEWAY_TIMEOUT,
        });
    }
}

class HttpVersionNotSupportedError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED,
        });
    }
}

class NetworkAuthenticationRequiredError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.NETWORK_AUTHENTICATION_REQUIRED,
        });
    }
}

class ValidationError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.BAD_REQUEST,
        });
    }
}

class PaymentRequiredError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.PAYMENT_REQUIRED,
        });
    }
}

class MethodNotAllowedError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.METHOD_NOT_ALLOWED,
        });
    }
}
class NotAcceptableError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.NOT_ACCEPTABLE,
        });
    }
}

class ProxyAuthenticationRequiredError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED,
        });
    }
}

class RequestTimeoutError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.REQUEST_TIMEOUT,
        });
    }
}

class GoneError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.GONE,
        });
    }
}

class LengthRequiredError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.LENGTH_REQUIRED,
        });
    }
}

class PreconditionFailedError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.PRECONDITION_FAILED,
        });
    }
}

class RequestTooLongError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.REQUEST_TOO_LONG,
        });
    }
}

class RequestUriTooLongError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.REQUEST_URI_TOO_LONG,
        });
    }
}

class UnsupportedMediaTypeError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.UNSUPPORTED_MEDIA_TYPE,
        });
    }
}

class RequestedRangeNotSatisfiableError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.REQUESTED_RANGE_NOT_SATISFIABLE,
        });
    }
}
class ExpectationFailedError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.EXPECTATION_FAILED,
        });
    }
}

class ImATeapotError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.IM_A_TEAPOT,
        });
    }
}

class InsufficientStorageError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.INSUFFICIENT_STORAGE,
        });
    }
}

class MethodFailureError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.METHOD_FAILURE,
        });
    }
}

class MisdirectedRequestError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.MISDIRECTED_REQUEST,
        });
    }
}


class LockedError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.LOCKED,
        });
    }
}

class FailedDependencyError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.FAILED_DEPENDENCY,
        });
    }
}

class PreconditionRequiredError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.PRECONDITION_REQUIRED,
        });
    }
}

class TooManyRequestsError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.TOO_MANY_REQUESTS,
        });
    }
}

class RequestHeaderFieldsTooLargeError extends ErrorResponse {constructor(params: any = {}) {
	super({
		...params,
		status: params.status || HttpStatusCode.TOO_MANY_REQUESTS,
	});
}
}

class UnavailableForLegalReasonsError extends ErrorResponse {
    constructor(params: any = {}) {
        super({
            ...params,
            status: params.status || HttpStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS,
        });
    }
}

const _ERROR = {
	ErrorResponse,
    BadRequestError, // 400
    ValidationError, // 409
	UnauthorizedError, // 401
	PaymentRequiredError, // 402
	ForbiddenError, // 403
	NotFoundError, // 404
	MethodNotAllowedError, // 405
	NotAcceptableError, // 406
	ProxyAuthenticationRequiredError, // 407
	RequestTimeoutError, // 408
	ConflictError, // 409
	GoneError, // 410
	LengthRequiredError, // 411
	PreconditionFailedError, // 412
	RequestTooLongError, // 413
	RequestUriTooLongError, // 414
	UnsupportedMediaTypeError, // 415
	RequestedRangeNotSatisfiableError, // 416
	ExpectationFailedError, // 417
	ImATeapotError, // 418
	InsufficientStorageError, // 419
	MethodFailureError, // 420
	MisdirectedRequestError, // 421
	UnprocessableEntityError, // 422
	LockedError, // 423
	FailedDependencyError, // 424
	PreconditionRequiredError, // 428
	TooManyRequestsError, // 429
	RequestHeaderFieldsTooLargeError, // 431
	UnavailableForLegalReasonsError, // 451
	InternalServerError, // 500
	NotImplementedError, // 501
	BadGatewayError, // 502
	ServiceUnavailableError, // 503
	GatewayTimeoutError, // 504
	HttpVersionNotSupportedError, // 505
	NetworkAuthenticationRequiredError // 511
};

export default _ERROR;


// // Authentication/Authorization
// 'permission-denied' -> ForbiddenError (403)
// 'unauthenticated' -> UnauthorizedError (401)

// // Resource Errors
// 'not-found' -> NotFoundError (404)
// 'already-exists' -> ConflictError (409)

// // Input Validation
// 'invalid-argument' -> BadRequestError (400)
// 'failed-precondition' -> PreconditionFailedError (412)

// // Rate Limiting
// 'resource-exhausted' -> TooManyRequestsError (429)

// // Server Issues
// 'unavailable' -> ServiceUnavailableError (503)
// 'internal' -> InternalServerError (500)
// 'deadline-exceeded' -> GatewayTimeoutError (504)