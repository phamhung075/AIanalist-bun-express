import { HttpStatusCode } from "./HttpStatusCode";

/**
 * HTTP Methods used in API routes.
 * OPTIONS and HEAD are handled automatically by web frameworks.
 */
const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    OPTION: 'OPTIONS',
} as const;

const API_CONFIG = {
    VERSION: '1.0.0',
    PREFIX: '/api/v1',
    TIMEOUT: 30_000, // 30 seconds
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100, // limit each IP to 100 requests per window
    },
    JSON: {
        LIMIT: '50mb', // Max request body size
    },
    CORS: {
        ORIGINS: {
            DEVELOPMENT: ['http://localhost:3333', 'http://localhost:4444'],
            PRODUCTION: ['http://localhost:3333', 'http://localhost:4444', 'http://192.168.0.21:4444'], // Update with your production URL
        },
        ALLOWED_HEADERS: ['Authorization', 'Content-Type', 'X-Requires-Auth', 'Origin'],
        EXPOSED_HEADERS: ['Content-Range', 'X-Content-Range', 'set-cookie'],
        METHODS: [
            HTTP_METHODS.GET,
            HTTP_METHODS.POST,
            HTTP_METHODS.PUT,
            HTTP_METHODS.PATCH,
            HTTP_METHODS.DELETE,
            HTTP_METHODS.OPTION,
        ],
        CREDENTIALS: true, // Allow cookies to be sent
    },    
    COMPRESSION: {
        LEVEL: 6,
        THRESHOLD: 1_024, // 1 KB
    },
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100,
    },
    CACHE: {
        TTL: 60 * 60, // 1 hour in seconds
        MAX: 1_000, // Max items in cache
    },
    SECURITY: {
        JWT: {
            ACCESS_TOKEN_EXPIRE: '1h',
            REFRESH_TOKEN_EXPIRE: '7d',
            ALGORITHM: 'HS256',
        },
        PASSWORD: {
            SALT_ROUNDS: 10,
            MIN_LENGTH: 8,
        },
    },
    LOGS: {
        DIR: 'logs',
        MAX_SIZE: '10m',
        MAX_FILES: '7d',
    },
} as const;



// Type Inference
export type HttpMethod = keyof typeof HTTP_METHODS;


/**
 * Common HTTP Content-Types used in API requests and responses.
 */
const CONTENT_TYPE = {
    JSON: 'application/json',
    FORM: 'application/x-www-form-urlencoded',
    MULTIPART: 'multipart/form-data',
    TEXT: 'text/plain',
    HTML: 'text/html',
    XML: 'application/xml',
    PDF: 'application/pdf',
} as const;

// Type Inference
export type ContentType = keyof typeof CONTENT_TYPE;


function setResponseType(type: ContentType) {
    return CONTENT_TYPE[type];
}

function handleRequest(method: HttpMethod) {
    switch (method) {
        case HTTP_METHODS.GET:
            console.log('Handling GET request');
            break;
    }
}

function getStatusText(code: number): string {
    return Object.entries(HttpStatusCode)
        .find(([_, value]) => value === code)?.[0] || 'UNKNOWN_STATUS';
}

export {
    getStatusText,
    API_CONFIG,
    CONTENT_TYPE, handleRequest, HTTP_METHODS, setResponseType
};
