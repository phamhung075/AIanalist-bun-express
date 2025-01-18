import { HttpStatusCode } from "./HttpStatusCode";

export const StatusCodes = {
    [HttpStatusCode.ACCEPTED]: { 
        code: HttpStatusCode.ACCEPTED, // 202
        phrase: "Accepted",
        description: "The request has been accepted for processing, but the processing has not been completed.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.3.3"
    },
    [HttpStatusCode.BAD_GATEWAY]: { 
        code: HttpStatusCode.BAD_GATEWAY, // 502
        phrase: "Bad Gateway",
        description: "The server, while acting as a gateway, received an invalid response from the upstream server.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.6.3"
    },
    [HttpStatusCode.BAD_REQUEST]: { 
        code: HttpStatusCode.BAD_REQUEST, // 400
        phrase: "Bad Request",
        description: "The server could not understand the request due to invalid syntax.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.1"
    },
    [HttpStatusCode.CONFLICT]: {
        code: HttpStatusCode.CONFLICT,  // 409
        phrase: "Conflict",
        description: "The request conflicts with the current state of the resource.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.8"
    },
    [HttpStatusCode.CONTINUE]: {
        code: HttpStatusCode.CONTINUE, // 100
        phrase: "Continue",
        description: "Indicates that the initial part of a request has been received and the client should continue.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.2.1"
    },
    [HttpStatusCode.CREATED]: { 
        code: HttpStatusCode.CREATED, // 201
        phrase: "Created",
        description: "The request has succeeded and a new resource has been created as a result.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.3.2"
    },
    [HttpStatusCode.EXPECTATION_FAILED]: { 
        code: HttpStatusCode.EXPECTATION_FAILED, // 417
        phrase: "Expectation Failed",
        description: "The expectation given in the Expect header field could not be met by the server.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.14"
    },
    [HttpStatusCode.FAILED_DEPENDENCY]: {
        code: HttpStatusCode.FAILED_DEPENDENCY,  // 424
        phrase: "Failed Dependency",
        description: "The request failed due to failure of a previous request.",
        documentation: "https://tools.ietf.org/html/rfc2518#section-10.5"
    },
    [HttpStatusCode.FORBIDDEN]: {
        code: HttpStatusCode.FORBIDDEN,  // 403
        phrase: "Forbidden",
        description: "The server understands the request, but it refuses to authorize it.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.3"
    },
    [HttpStatusCode.GATEWAY_TIMEOUT]: {
        code: HttpStatusCode.GATEWAY_TIMEOUT,  // 504
        phrase: "Gateway Timeout",
        description: "The server, while acting as a gateway, did not get a response in time.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.6.5"
    },
    [HttpStatusCode.GONE]: {
        code: HttpStatusCode.GONE,  // 410
        phrase: "Gone",
        description: "The requested resource is no longer available at the server and no forwarding address is known.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.9"
    },
    [HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED]: {
        code: HttpStatusCode.HTTP_VERSION_NOT_SUPPORTED,  // 505
        phrase: "HTTP Version Not Supported",
        description: "The server does not support the HTTP protocol version used in the request.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.6.6"
    },
    [HttpStatusCode.IM_A_TEAPOT]: {
        code: HttpStatusCode.IM_A_TEAPOT,  // 418
        phrase: "I'm a teapot",
        description: "Any attempt to brew coffee with a teapot should result in this error.",
        documentation: "https://tools.ietf.org/html/rfc2324#section-2.3.2"
    },
    [HttpStatusCode.INSUFFICIENT_SPACE_ON_RESOURCE]: {
        code: HttpStatusCode.INSUFFICIENT_SPACE_ON_RESOURCE,  // 419
        phrase: "Insufficient Space on Resource",
        description: "The server cannot store the representation needed to complete the request.",
        documentation: "https://tools.ietf.org/html/rfc2518#section-10.6"
    },
    [HttpStatusCode.INSUFFICIENT_STORAGE]: {
        code: HttpStatusCode.INSUFFICIENT_STORAGE,  // 507
        phrase: "Insufficient Storage",
        description: "The server does not have enough storage space to complete the request.",
        documentation: "https://tools.ietf.org/html/rfc2518#section-10.6"
    },
    [HttpStatusCode.INTERNAL_SERVER_ERROR]: {
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,  // 500
        phrase: "Internal Server Error",
        description: "The server encountered an unexpected condition that prevented it from fulfilling the request.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.6.1"
    },
    [HttpStatusCode.LENGTH_REQUIRED]: {
        code: HttpStatusCode.LENGTH_REQUIRED,  // 411
        phrase: "Length Required",
        description: "The server refuses to accept the request without a defined Content-Length.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.10"
    },
    [HttpStatusCode.LOCKED]: {
        code: HttpStatusCode.LOCKED,  // 423
        phrase: "Locked",
        description: "The resource that is being accessed is locked.",
        documentation: "https://tools.ietf.org/html/rfc2518#section-10.4"
    },
    [HttpStatusCode.METHOD_FAILURE]: {
        code: HttpStatusCode.METHOD_FAILURE,  // 424
        phrase: "Method Failure",
        description: "A deprecated response indicating a method failure, primarily used by the Spring Framework.",
        documentation: "https://tools.ietf.org/rfcdiff?difftype=--hwdiff&url2=draft-ietf-webdav-protocol-06.txt"
    },
    [HttpStatusCode.METHOD_NOT_ALLOWED]: {
        code: HttpStatusCode.METHOD_NOT_ALLOWED,  // 405
        phrase: "Method Not Allowed",
        description: "The request method is known by the server but has been disabled and cannot be used.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.5"
    },
    [HttpStatusCode.MOVED_PERMANENTLY]: {
        code: HttpStatusCode.MOVED_PERMANENTLY,  // 301
        phrase: "Moved Permanently",
        description: "The requested resource has been permanently moved to a new URI.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.4.2"
    },
    [HttpStatusCode.MOVED_TEMPORARILY]: {
        code: HttpStatusCode.MOVED_TEMPORARILY,  // 302
        phrase: "Moved Temporarily",
        description: "The resource has been temporarily moved to a different URI.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.4.3"
    },
    [HttpStatusCode.MULTI_STATUS]: {
        code: HttpStatusCode.MULTI_STATUS,  // 207
        phrase: "Multi-Status",
        description: "Conveys information about multiple resources in situations where multiple status codes might be appropriate.",
        documentation: "https://tools.ietf.org/html/rfc2518#section-10.2"
    },
    [HttpStatusCode.ALREADY_REPORTED]: {
        code: HttpStatusCode.ALREADY_REPORTED, // 208
        phrase: "Already Reported",
        description: "The same resource was requested multiple times and is already reported.",
        documentation: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/208"
    },
    [HttpStatusCode.IM_USED]: {
        code: HttpStatusCode.IM_USED,  // 226
        phrase: "IM Used",
        description: "The server has fulfilled a request for the resource, and the response represents the result of one or more instance manipulations applied to the current instance.",
        documentation: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/226"
    },
    [HttpStatusCode.MULTIPLE_CHOICES]: {
        code: HttpStatusCode.MULTIPLE_CHOICES,  // 300
        phrase: "Multiple Choices",
        description: "The request has more than one possible response. The user-agent or user should choose one of them.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.4.1"
    },
    [HttpStatusCode.NETWORK_AUTHENTICATION_REQUIRED]: {
        code: HttpStatusCode.NETWORK_AUTHENTICATION_REQUIRED, // 511
        phrase: "Network Authentication Required",
        description: "The client needs to authenticate to gain network access.",
        documentation: "https://tools.ietf.org/html/rfc6585#section-6"
    },
    [HttpStatusCode.NO_CONTENT]: {
        code: HttpStatusCode.NO_CONTENT,  // 204
        phrase: "No Content",
        description: "The server successfully processed the request, but is not returning any content.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.3.5"
    },
    [HttpStatusCode.NON_AUTHORITATIVE_INFORMATION]: {
        code: HttpStatusCode.NON_AUTHORITATIVE_INFORMATION,  // 203
        phrase: "Non-Authoritative Information",
        description: "The returned meta-information is not exactly the same as available from the origin server.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.3.4"
    },
    [HttpStatusCode.NOT_ACCEPTABLE]: {
        code: HttpStatusCode.NOT_ACCEPTABLE,  // 406
        phrase: "Not Acceptable",
        description: "The server cannot produce a response matching the list of acceptable values defined in the request's proactive content negotiation headers.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.6"
    },
    [HttpStatusCode.NOT_FOUND]: {
        code: HttpStatusCode.NOT_FOUND,  // 404
        phrase: "Not Found",
        description: "The server cannot find the requested resource.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.4"
    },
    [HttpStatusCode.NOT_IMPLEMENTED]: {
        code: HttpStatusCode.NOT_IMPLEMENTED,  // 501
        phrase: "Not Implemented",
        description: "The request method is not supported by the server and cannot be handled.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.6.2"
    },
    [HttpStatusCode.NOT_MODIFIED]: {
        code: HttpStatusCode.NOT_MODIFIED,  // 304
        phrase: "Not Modified",
        description: "Indicates that the resource has not been modified since the last request.",
        documentation: "https://tools.ietf.org/html/rfc7232#section-4.1"
    },
    [HttpStatusCode.OK]: {
        code: HttpStatusCode.OK,  // 200
        phrase: "OK",
        description: "The request has succeeded.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.3.1"
    },
    [HttpStatusCode.PARTIAL_CONTENT]: {
        code: HttpStatusCode.PARTIAL_CONTENT,  // 206
        phrase: "Partial Content",
        description: "The server successfully processed a partial GET request.",
        documentation: "https://tools.ietf.org/html/rfc7233#section-4.1"
    },
    [HttpStatusCode.PAYMENT_REQUIRED]: {
        code: HttpStatusCode.PAYMENT_REQUIRED,  // 402
        phrase: "Payment Required",
        description: "Reserved for future use. Intended for digital payment systems.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.2"
    },
    [HttpStatusCode.PERMANENT_REDIRECT]: {
        code: HttpStatusCode.PERMANENT_REDIRECT,  // 308
        phrase: "Permanent Redirect",
        description: "The resource has been permanently moved to a new URI.",
        documentation: "https://tools.ietf.org/html/rfc7538#section-3"
    },
    [HttpStatusCode.PRECONDITION_FAILED]: {
        code: HttpStatusCode.PRECONDITION_FAILED,  // 412
        phrase: "Precondition Failed",
        description: "The server does not meet one of the preconditions specified by the client.",
        documentation: "https://tools.ietf.org/html/rfc7232#section-4.2"
    },
    [HttpStatusCode.PRECONDITION_REQUIRED]: {
        code: HttpStatusCode.PRECONDITION_REQUIRED,  // 428
        phrase: "Precondition Required",
        description: "The server requires the request to be conditional to prevent conflicts.",
        documentation: "https://tools.ietf.org/html/rfc6585#section-3"
    },
    [HttpStatusCode.PROCESSING]: {
        code: HttpStatusCode.PROCESSING,  // 102
        phrase: "Processing",
        description: "The server has received and is processing the request, but no response is available yet.",
        documentation: "https://tools.ietf.org/html/rfc2518#section-10.1"
    },
    [HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED]: {
        code: HttpStatusCode.PROXY_AUTHENTICATION_REQUIRED,  // 407
        phrase: "Proxy Authentication Required",
        description: "Authentication is required to access the resource through a proxy.",
        documentation: "https://tools.ietf.org/html/rfc7235#section-3.2"
    },
    [HttpStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE]: {
        code: HttpStatusCode.REQUEST_HEADER_FIELDS_TOO_LARGE,  // 431
        phrase: "Request Header Fields Too Large",
        description: "The request header fields are too large for the server to process.",
        documentation: "https://tools.ietf.org/html/rfc6585#section-5"
    },
    [HttpStatusCode.REQUEST_TIMEOUT]: {
        code: HttpStatusCode.REQUEST_TIMEOUT,  // 408
        phrase: "Request Timeout",
        description: "The server timed out waiting for the request.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.7"
    },
    [HttpStatusCode.REQUEST_TOO_LONG]: {
        code: HttpStatusCode.REQUEST_TOO_LONG,  // 413
        phrase: "Request Entity Too Large",
        description: "The request payload is larger than the server is willing or able to process.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.11"
    },
    [HttpStatusCode.REQUEST_URI_TOO_LONG]: {
        code: HttpStatusCode.REQUEST_URI_TOO_LONG,  // 414
        phrase: "Request-URI Too Long",
        description: "The URI provided in the request is too long for the server to interpret.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.12"
    },
    [HttpStatusCode.REQUESTED_RANGE_NOT_SATISFIABLE]: {
        code: HttpStatusCode.REQUESTED_RANGE_NOT_SATISFIABLE,  // 416
        phrase: "Requested Range Not Satisfiable",
        description: "The requested range specified in the Range header field cannot be fulfilled.",
        documentation: "https://tools.ietf.org/html/rfc7233#section-4.4"
    },
    [HttpStatusCode.RESET_CONTENT]: {
        code: HttpStatusCode.RESET_CONTENT,  // 205
        phrase: "Reset Content",
        description: "Indicates that the client should reset the document view.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.3.6"
    },
    [HttpStatusCode.SEE_OTHER]: {
        code: HttpStatusCode.SEE_OTHER,  // 303
        phrase: "See Other",
        description: "The resource is located at a different URI, and the client should retrieve it using a GET request.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.4.4"
    },
    [HttpStatusCode.SERVICE_UNAVAILABLE]: {
        code: HttpStatusCode.SERVICE_UNAVAILABLE,  // 503
        phrase: "Service Unavailable",
        description: "The server is temporarily unable to handle the request, often due to maintenance or overload.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.6.4"
    },
    [HttpStatusCode.SWITCHING_PROTOCOLS]: {
        code: HttpStatusCode.SWITCHING_PROTOCOLS,  // 101
        phrase: "Switching Protocols",
        description: "The server is switching protocols as requested by the client via the Upgrade header.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.2.2"
    },
    [HttpStatusCode.TEMPORARY_REDIRECT]: {
        code: HttpStatusCode.TEMPORARY_REDIRECT,  // 307
        phrase: "Temporary Redirect",
        description: "The resource is temporarily located at a different URI, and the same request method should be used.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.4.7"
    },
    [HttpStatusCode.TOO_MANY_REQUESTS]: {
        code: HttpStatusCode.TOO_MANY_REQUESTS,  // 429
        phrase: "Too Many Requests",
        description: "The client has sent too many requests in a given period.",
        documentation: "https://tools.ietf.org/html/rfc6585#section-4"
    },
    [HttpStatusCode.UNAUTHORIZED]: {
        code: HttpStatusCode.UNAUTHORIZED, // 401
        phrase: "Unauthorized",
        description: "The client must authenticate itself to get the requested response.",
        documentation: "https://tools.ietf.org/html/rfc7235#section-3.1"
    },
    [HttpStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS]: {
        code: HttpStatusCode.UNAVAILABLE_FOR_LEGAL_REASONS,  // 451
        phrase: "Unavailable For Legal Reasons",
        description: "The requested resource cannot legally be provided, often due to censorship or government restrictions.",
        documentation: "https://tools.ietf.org/html/rfc7725"
    },
    [HttpStatusCode.UNPROCESSABLE_ENTITY]: {
        code: HttpStatusCode.UNPROCESSABLE_ENTITY, // 422
        phrase: "Unprocessable Entity",
        description: "The request was well-formed but was unable to be followed due to semantic errors.",
        documentation: "https://tools.ietf.org/html/rfc2518#section-10.3"
    },
    [HttpStatusCode.UNSUPPORTED_MEDIA_TYPE]: {
        code: HttpStatusCode.UNSUPPORTED_MEDIA_TYPE,  // 415
        phrase: "Unsupported Media Type",
        description: "The server does not support the media format of the requested data.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.5.13"
    },
    [HttpStatusCode.USE_PROXY]: {
        code: HttpStatusCode.USE_PROXY,  // 305
        phrase: "Use Proxy",
        description: "This response code is deprecated and indicates that a requested response must be accessed by a proxy.",
        documentation: "https://tools.ietf.org/html/rfc7231#section-6.4.6"
    },
    [HttpStatusCode.MISDIRECTED_REQUEST]: {
        code: HttpStatusCode.MISDIRECTED_REQUEST,  // 421
        phrase: "Misdirected Request",
        description: "The server cannot produce a response for the combination of scheme and authority included in the request URI.",
        documentation: "https://datatracker.ietf.org/doc/html/rfc7540#section-9.1.2"
    }    
};