# Monolith Modular RESTful API HATEOAS Implementation Guide with Bun, Express.js, Langchain, TypeScript

(on progress)

## 📚 **Project Foundation and Tools**

- **Bun & Express.js:** Web server framework for handling HTTP requests.
- **TypeScript:** Strong typing and better development experience.
- **express-route-tracker:** Route management with HATEOAS support.
- **Firebase:** Database and authentication.
- **Pinecone:** Vector database for AI chat history.
- **OpenAI:** AI chat service.
- **Langchain:** AI chat framework.
- **Validation:** Zod.

## 📖 **Key RESTful API Design Principles**

1. **Resources:** Represent data as resources (e.g., contacts, products).
2. **HTTP Methods:**
   - **GET:** Retrieve data.
   - **POST:** Create resources.
   - **PUT:** Fully update a resource.
   - **PATCH:** Partially update a resource.
   - **DELETE:** Remove a resource.
3. **Status Codes:** Use meaningful HTTP status codes (e.g., 200 OK, 201 Created, 400 Bad Request).
4. **HATEOAS:** Enable API discoverability through hypermedia links.
5. **JSON:** Use JSON for data exchange.

## 🛠️ **Implementation Steps**

### 0. **environment**

```
├── src/
│   ├── environment/
│   │   ├── .env.development/
│   │   ├── .env.production/
│   │   ├── .env.test/
│   │   ├── ai-analyst-14876-firebase-adminsdk-euw8h-wwwwwww.json  <-- your filebase config admin
```

.env.development

```
NODE_ENV=development
PORT=3333
HOST=localhost
OPENAI_API_KEY=sk-proj-EGAAmB5Z_w04XSxJBoFagMDFsNMYTQ6-MWjEKuBCwOIQv9AfVjJfb0A-xxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URI=https://server-default-rtdb.europe-west1.firebasedatabase.app
TEST_VAR=loaded
BASE_API=/api
IP_FRONTEND=192.168.0.1
LOG_DIR="logs"

#Firebase Config
FIREBASE_API_KEY=AIzaSyCkjEl-xxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxxxxxxxxxxxxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=server-xxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxxxxxxxxxxxxxx.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_APP_ID=1:xxxxxxxxxxxxxxxxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_MEASUREMENT_ID=G-xxxxxxxxxxxxxxxxxxxxxxxxxx

#pinecone
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
PINECONE_REGION=us-east-xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 1. **Router Creation**

- Use `createRouter(__filename)` for defining routes.

**Example:**

```typescript
import { createRouter } from "express-route-tracker";
import { Router } from "express";

const router: Router = createRouter(__filename);

router.get("/example", (req, res) => {
  res.json({ message: "Hello from example route!" });
});

export default router;
```

- Track file sources with `express-route-tracker`.

### 2. **HATEOAS Integration**

- Add `createHATEOASMiddleware` to your routes.

**Example:**

```typescript
import { createHATEOASMiddleware } from "express-route-tracker";
import { Router } from "express";

const router: Router = createRouter(__filename);

router.use(
  createHATEOASMiddleware({
    autoIncludeSameRoute: true,
    baseUrl: "/api",
    includePagination: true,
    customLinks: {
      self: "/api/example",
      docs: "/api/docs",
    },
  })
);

router.get("/example", (req, res) => {
  res.json({ message: "Hello with HATEOAS links!" });
});

export default router;
```

- Enable pagination and custom link generation.

### 3. **Module-Based Routes**

- Organize routes in dedicated directories (e.g., `src/modules/contact`).

### 4. **Controllers**

**Example:**

```typescript
import { Request, Response } from "express";
import _ERROR from "../helper/http-status/error/index.js";
import _SUCCESS from "../helper/http-status/success/index.js";

export const getExampleData = (
  req: CustomRequest,
  res: Response,
  _next: NextFunction
) => {
  try {
    const data = { id: 1, name: "Sample Data" };
    return new _SUCCESS.OkSuccess({
      message: "Fetched entity by ID successfully",
      data: entity,
    }).send(res, _next);
  } catch (error) {
    _next(error);
  }
};

//example error throw on controller or middleware
if (!token) {
  return new _ERROR.UnauthorizedError({
    message: "Unauthorized: No token provided",
  }).send(res, next);
}

//example error throw on function, service or repository
if (!token) {
  return new _ERROR.UnauthorizedError({
    message: "Unauthorized: No token provided",
  });
}
```

- Validate data using `validateSchema(CreateContactSchema)`.



### 5. **Controllers Modules**

**Example:**

```typescript
import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import type { CreateInput, UpdateInput } from './contact.dto';
import type { IContact } from './contact.interface';
import type ContactService from './contact.service';
import { BindMethods } from '@/_core/decorators/bind-methods.decorator';


@Service()
@BindMethods()
class ContactController extends BaseController<IContact, CreateInput, UpdateInput> {
    constructor(
        protected readonly contactService: ContactService  // Change to protected and add @Inject()
    ) {
        super(contactService);
    }
    //CRUD methods is inherited from BaseController

    //other methods
}

export default ContactController;
```

### 6. **Services Modules**

**Example:**

```typescript
// contact.service.ts

import { Service } from 'typedi';
import { BaseService } from "../_base/crud/BaseService";
import type { IContact } from "./contact.interface";
import type ContactRepository from "./contact.repository";


@Service()
class ContactService extends BaseService<IContact> {
    constructor(
        protected readonly repository: ContactRepository
    ) {
        super(repository);
    }
    
    //CRUD methods is inherited from BaseController


    //other methods
}

export default ContactService;
```

### 7. **Repositories Modules**

- Abstract data access logic (e.g., `contact.repository.ts`).


```typescript
// contact.repository.ts
import { Service } from 'typedi';
import { BaseRepository } from '../_base/crud/BaseRepository';
import type { IContact } from './contact.interface';

@Service()
class ContactRepository extends BaseRepository<IContact> {
    constructor() {
        super('contacts');
    }
    //CRUD methods is inherited from BaseController

    //other methods
}

export default ContactRepository;
```

### 8. **Validation**

- Employ **Zod** for schema-based input validation.

### 9. **Modules Configuration Example**

```typescript
// src/modules/contact/contact.module.ts
import { Container } from 'typedi';
import ContactController from './contact.controller';
import ContactRepository from './contact.repository';
import ContactService from './contact.service';


class ContactModule {
    private static instance: ContactModule;
    public contactController: ContactController;
    public contactService: ContactService;
    public contactRepository: ContactRepository;

    private constructor() {
        // First create repository
        this.contactRepository = new ContactRepository();
        Container.set('ContactRepository', this.contactRepository);

        // Then create service with repository
        this.contactService = new ContactService(this.contactRepository);
        Container.set('ContactService', this.contactService);

        // Finally create controller with service
        this.contactController = new ContactController(this.contactService);
        Container.set('ContactController', this.contactController);
    }

    public static getInstance(): ContactModule {
        if (!ContactModule.instance) {
            ContactModule.instance = new ContactModule();
        }
        return ContactModule.instance;
    }
}

const contactModule = ContactModule.getInstance();
export const { contactController, contactService, contactRepository } = contactModule;

```

## 10. **Inter Modules Communication**

  The Auth module calls the Contact module to create a contact during registration


## 🔗 **HATEOAS Details**

- Automatically generates hypermedia links (`self`, `next`, `prev`).
- Pagination links are added with `includePagination`.

## ⚙️ **Configuration**

- `src/_core/helper/http-status/common/api-config.ts` manages API prefix, pagination, rate limits, and CORS.

## 🚨 **Error Management**

- Centralized error handling with `RestHandler.error`.
- Error codes defined in `HttpStatusCode.ts`.

## ✅ **Steps Summary**

1. Define Resources.
2. Map Routes.
3. Implement Controllers.
4. Add Services.
5. Create Repositories.
6. Integrate HATEOAS.
7. Validate Input.
8. Handle Errors.

## 📷 **Example Screenshot**

![Run](https://scontent.fctt1-1.fna.fbcdn.net/v/t1.15752-9/471453803_566124249589841_3236167951397755768_n.png?_nc_cat=110&ccb=1-7&_nc_sid=9f807c&_nc_ohc=D92g0dM9ZrYQ7kNvgHSxNH_&_nc_zt=23&_nc_ht=scontent.fctt1-1.fna&oh=03_Q7cD1gGOqt-n_WnUGkELyypLJfGj-a2mWbIntisgXIQsuBMkcg&oe=6799456B)

![Console Log request](https://scontent.fctt1-1.fna.fbcdn.net/v/t1.15752-9/462573393_637184128693842_7510104037535305269_n.png?_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_ohc=Q6xKSFbm_pwQ7kNvgE78TQJ&_nc_zt=23&_nc_ht=scontent.fctt1-1.fna&oh=03_Q7cD1gFwjoZ1Og6Xru1QNoShJ0b9aL6TVv0aeasS7VKq3GMb8g&oe=67995635)

![Important Log ](https://scontent.xx.fbcdn.net/v/t1.15752-9/462577183_1521197635219617_5938353982022041730_n.png?_nc_cat=101&ccb=1-7&_nc_sid=0024fc&_nc_ohc=RTO2q1A6qLQQ7kNvgE9_R6R&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=03_Q7cD1gGlC-hIQA6lKZpc2lKKNhaDcl9yeSVsi47Qk11CMW8cyA&oe=6799414E)

![Error Log ](https://scontent.fctt1-1.fna.fbcdn.net/v/t1.15752-9/462570903_1134773754680523_7473195736379572011_n.png?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_ohc=ZSBpsy__irgQ7kNvgHaCzFl&_nc_zt=23&_nc_ht=scontent.fctt1-1.fna&oh=03_Q7cD1gGn1QhxqjAXyOfi9S3FUxTiuxAehA8y8G9tbQCGFaWKhA&oe=67995228)

---

## **Example Postman response**

`POST http://localhost:3333/api/auth/login`

postman: 200 OK

Request successful. The server has responded as required.

access-token and refresh token is set on cookies

```
{
    "success": true,
    "message": "User logged in successfully",
    "data": {},
    "metadata": {
        "description": "The request has succeeded.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.3.1",
        "responseTime": "466ms",
        "timestamp": "2025-01-18T19:56:52.392Z",
        "code": 200,
        "status": "OK"
    },
    "options": {
        "headers": {
            "Cache-Control": "no-store",
            "Access-Control-Allow-Credentials": "true"
        }
    },
    "links": {
        "self": {
            "rel": "self",
            "href": "localhost:3333/api/auth/login",
            "method": "POST"
        },
        "post-registre": {
            "title": "POST /registre",
            "rel": "post-registre",
            "href": "localhost:3333/api/auth/registre",
            "method": "POST"
        },
        "post-login": {
            "title": "POST /login",
            "rel": "post-login",
            "href": "localhost:3333/api/auth/login",
            "method": "POST"
        },
        "get-current": {
            "title": "GET /current",
            "rel": "get-current",
            "href": "localhost:3333/api/auth/current",
            "method": "GET"
        },
        "get-verify": {
            "title": "GET /verify",
            "rel": "get-verify",
            "href": "localhost:3333/api/auth/verify",
            "method": "GET"
        },
        "get-refreshtoken": {
            "title": "GET /refreshtoken",
            "rel": "get-refreshtoken",
            "href": "localhost:3333/api/auth/refreshtoken",
            "method": "GET"
        },
        "documentation": {
            "rel": "documentation",
            "href": "localhost:3333/docs",
            "method": "GET",
            "title": "API Documentation"
        }
    }
}
```

`GET http://localhost:3333/api/auth/current`

postman: 200 OK

Request successful. The server has responded as required.

```
{
    "success": true,
    "message": "User fetched successfully",
    "data": {
        "iss": "https://securetoken.google.com/ai-analyst-14876",
        "aud": "ai-analyst-14876",
        "auth_time": 1737230210,
        "user_id": "VMOmNW6sn0hsyghC1hZWeyGECvD3",
        "sub": "VMOmNW6sn0hsyghC1hZWeyGECvD3",
        "iat": 1737230264,
        "exp": 1737233864,
        "email": "test.email34816@yopmail.com",
        "email_verified": false,
        "firebase": {
            "identities": {
                "email": [
                    "test.email34816@yopmail.com"
                ]
            },
            "sign_in_provider": "password"
        },
        "uid": "VMOmNW6sn0hsyghC1hZWeyGECvD3"
    },
    "metadata": {
        "description": "The request has succeeded.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.3.1",
        "responseTime": "28ms",
        "timestamp": "2025-01-18T19:57:53.520Z",
        "code": 200,
        "status": "OK"
    },
    "links": {
        "self": {
            "rel": "self",
            "href": "localhost:3333/api/auth/current",
            "method": "GET"
        },
        "post-registre": {
            "title": "POST /registre",
            "rel": "post-registre",
            "href": "localhost:3333/api/auth/registre",
            "method": "POST"
        },
        "post-login": {
            "title": "POST /login",
            "rel": "post-login",
            "href": "localhost:3333/api/auth/login",
            "method": "POST"
        },
        "get-current": {
            "title": "GET /current",
            "rel": "get-current",
            "href": "localhost:3333/api/auth/current",
            "method": "GET"
        },
        "get-verify": {
            "title": "GET /verify",
            "rel": "get-verify",
            "href": "localhost:3333/api/auth/verify",
            "method": "GET"
        },
        "get-refreshtoken": {
            "title": "GET /refreshtoken",
            "rel": "get-refreshtoken",
            "href": "localhost:3333/api/auth/refreshtoken",
            "method": "GET"
        },
        "documentation": {
            "rel": "documentation",
            "href": "localhost:3333/docs",
            "method": "GET",
            "title": "API Documentation"
        }
    }
}
```

`GET localhost:3333/api/contact/yQg9OD4KRTNywa2fHwxN`

postman: 200 OK

Request successful. The server has responded as required.

```
{
    "success": true,
    "message": "Fetched entity by ID successfully",
    "data": {
        "id": "yQg9OD4KRTNywa2fHwxN",
        "name": "Jett Zboncak",
        "email": "test.email19214@yopmail.com",
        "phone": "06 26 73 76 92",
        "message": "Interested in your services",
        "createdAt": {
            "_seconds": 1735267038,
            "_nanoseconds": 739000000
        },
        "updatedAt": {
            "_seconds": 1735267038,
            "_nanoseconds": 739000000
        }
    },
    "metadata": {
        "description": "The request has succeeded.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.3.1",
        "timestamp": "2025-01-18T19:59:10.616Z",
        "responseTime": "163ms",
        "code": 200,
        "status": "OK"
    },
    "links": {
        "self": {
            "rel": "self",
            "href": "localhost:3333/api/contact/yQg9OD4KRTNywa2fHwxN",
            "method": "GET"
        },
        "create": {
            "title": "POST /",
            "rel": "create",
            "href": "localhost:3333/api/contact/",
            "method": "POST"
        },
        "collection": {
            "title": "GET /",
            "rel": "collection",
            "href": "localhost:3333/api/contact/",
            "method": "GET"
        },
        "item": {
            "title": "GET /:id",
            "rel": "item",
            "href": "localhost:3333/api/contact/yQg9OD4KRTNywa2fHwxN",
            "method": "GET"
        },
        "update": {
            "title": "PUT /:id",
            "rel": "update",
            "href": "localhost:3333/api/contact/yQg9OD4KRTNywa2fHwxN",
            "method": "PUT"
        },
        "partial-update": {
            "title": "PATCH /:id",
            "rel": "partial-update",
            "href": "localhost:3333/api/contact/yQg9OD4KRTNywa2fHwxN",
            "method": "PATCH"
        },
        "delete": {
            "title": "DELETE /:id",
            "rel": "delete",
            "href": "localhost:3333/api/contact/yQg9OD4KRTNywa2fHwxN",
            "method": "DELETE"
        },
        "documentation": {
            "rel": "documentation",
            "href": "localhost:3333/docs",
            "method": "GET",
            "title": "API Documentation"
        }
    }
}
```

`http://localhost:3333/api/contact?page=1&limit=2&sort=createdAt&order=desc`

postman: 200 OK

Request successful. The server has responded as required.

```
{
    "success": true,
    "message": "Fetched entities successfully",
    "data": {},
    "pagination": {
        "data": [
            {
                "id": "hKcgv1n1eIPqhv5UlMI0kIUcRyk1",
                "firstName": "Myrtis",
                "lastName": "Hermann",
                "phone": "06 67 36 17 49",
                "address": "595 Viva Route",
                "postalCode": "57825",
                "city": "New Isadoreside",
                "country": "France",
                "email": "test.email25380@yopmail.com",
                "createdAt": {
                    "_seconds": 1737391984,
                    "_nanoseconds": 351000000
                },
                "updatedAt": {
                    "_seconds": 1737391984,
                    "_nanoseconds": 351000000
                }
            },
            {
                "id": "fD2GU80lvTumZa7ZfmX6",
                "firstName": "Ernesto",
                "lastName": "Cummings",
                "email": "test.email94603@yopmail.com",
                "phone": "06 13 32 98 51",
                "createdAt": {
                    "_seconds": 1737391684,
                    "_nanoseconds": 433000000
                },
                "updatedAt": {
                    "_seconds": 1737391684,
                    "_nanoseconds": 433000000
                }
            }
        ],
        "totalItems": 41,
        "count": 2,
        "page": 1,
        "totalPages": 21,
        "limit": 2,
        "hasNext": true,
        "hasPrev": false
    },
    "metadata": {
        "description": "The request has succeeded.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.3.1",
        "timestamp": "2025-01-21T00:08:22.706Z",
        "responseTime": "240ms",
        "code": 200,
        "status": "OK"
    },
    "links": {
        "self": {
            "rel": "self",
            "href": "localhost:3333/api/contact?page=1&sort=createdAt&order=desc&limit=2",
            "method": "GET"
        },
        "first": {
            "rel": "first",
            "href": "localhost:3333/?page=1",
            "method": "GET"
        },
        "last": {
            "rel": "last",
            "href": "localhost:3333/?page=21",
            "method": "GET"
        },
        "create": {
            "title": "POST /",
            "rel": "create",
            "href": "localhost:3333/api/contact/",
            "method": "POST"
        },
        "collection": {
            "title": "GET /",
            "rel": "collection",
            "href": "localhost:3333/api/contact/",
            "method": "GET"
        },
        "item": {
            "title": "GET /:id",
            "rel": "item",
            "href": "localhost:3333/api/contact/:id",
            "method": "GET"
        },
        "partial-update": {
            "title": "PATCH /:id",
            "rel": "partial-update",
            "href": "localhost:3333/api/contact/:id",
            "method": "PATCH"
        },
        "delete": {
            "title": "DELETE /:id",
            "rel": "delete",
            "href": "localhost:3333/api/contact/:id",
            "method": "DELETE"
        },
        "documentation": {
            "rel": "documentation",
            "href": "localhost:3333/docs",
            "method": "GET",
            "title": "API Documentation"
        }
    }
}
```

`POST http://localhost:3333/api/contact`

validation fail

postman: 400 Bad Request

The server could not understand the request. Maybe a bad syntax?

```
{
    "success": false,
    "message": "Validation Error",
    "error": true,
    "metadata": {
        "description": "The server could not understand the request due to invalid syntax.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
        "timestamp": "2025-01-18T17:15:59.353Z",
        "responseTime": "76ms",
        "code": 400,
        "status": "BAD_REQUEST"
    },
    "errors": [
        {
            "field": "lastName",
            "message": "Required"
        },
        {
            "field": "email",
            "message": "Required"
        },
        {
            "field": "phone",
            "message": "Required"
        }
    ],
    "links": {
        "self": {
            "rel": "self",
            "href": "localhost:3333/api/contact",
            "method": "POST"
        },
        "create": {
            "title": "POST /",
            "rel": "create",
            "href": "localhost:3333/api/contact/",
            "method": "POST"
        },
        "collection": {
            "title": "GET /",
            "rel": "collection",
            "href": "localhost:3333/api/contact/",
            "method": "GET"
        },
        "item": {
            "title": "GET /:id",
            "rel": "item",
            "href": "localhost:3333/api/contact/:id",
            "method": "GET"
        },
        "update": {
            "title": "PUT /:id",
            "rel": "update",
            "href": "localhost:3333/api/contact/:id",
            "method": "PUT"
        },
        "partial-update": {
            "title": "PATCH /:id",
            "rel": "partial-update",
            "href": "localhost:3333/api/contact/:id",
            "method": "PATCH"
        },
        "delete": {
            "title": "DELETE /:id",
            "rel": "delete",
            "href": "localhost:3333/api/contact/:id",
            "method": "DELETE"
        },
        "documentation": {
            "rel": "documentation",
            "href": "localhost:3333/docs",
            "method": "GET",
            "title": "API Documentation"
        }
    }
}
```

`http://localhost:3333/api/contactssssssss`

route not found

postman: 404 Not Found

Requested resource could not be found. 😐

```
{
    "success": false,
    "message": "The requested resource was not found.",
    "error": true,
    "metadata": {
        "description": "The server cannot find the requested resource.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
        "timestamp": "2025-01-18T20:07:28.241Z",
        "responseTime": "9ms",
        "code": 404,
        "status": "NOT_FOUND"
    }
}
```

`GET localhost:3333/api/contact/yQg9OD4KRTNywa2fHwxN`
not login

postman: 401 Unauthorized

The request is unauthenticated.

```
{
    "success": false,
    "message": "Unauthorized: No token provided",
    "error": true,
    "metadata": {
        "description": "The client must authenticate itself to get the requested response.",
        "documentation": "https://tools.ietf.org/html/rfc7235#section-3.1",
        "timestamp": "2025-01-18T20:08:32.986Z",
        "responseTime": "4ms",
        "code": 401,
        "status": "UNAUTHORIZED"
    }
}
```

```
Directory structure:
├── src/
│   ├── _core/
│   │   ├── auth/
│   │   │   ├── __specs__/
│   │   │   │   ├── auth.controller.spec.ts
│   │   │   │   ├── auth.repository.spec.ts
│   │   │   │   └── auth.service.spec.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── auth.interface.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.repository.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── index.ts
│   │   ├── config/
│   │   │   ├── __specs__/
│   │   │   │   └── dotenv.config.spec.ts
│   │   │   ├── dotenv.config.ts
│   │   │   └── firebase-admin.account.ts
│   │   ├── database/
│   │   │   ├── firebase-admin-sdk/
│   │   │   │   ├── firebase-test-config.ts
│   │   │   │   ├── FirestorePaginatorServerSide.ts
│   │   │   │   └── index.ts
│   │   │   └── firebase-client/
│   │   │       ├── __specs__/
│   │   │       │   └── FirestorePaginator.spec.ts
│   │   │       └── FirestorePaginatorClientSide.ts
│   │   ├── decorators/
│   │   │   └── bind-methods.decorator.ts
│   │   ├── helper/
│   │   │   ├── asyncHandler/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── asyncHandler.spec.ts
│   │   │   │   └── index.ts
│   │   │   ├── check-system-overload/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── check-system-overload.spec.ts
│   │   │   │   └── check-system-overload.ts
│   │   │   ├── http-status/
│   │   │   │   ├── common/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── createPagination.spec.ts
│   │   │   │   │   ├── api-config.ts
│   │   │   │   │   ├── create-pagination.ts
│   │   │   │   │   ├── HttpStatusCode.ts
│   │   │   │   │   └── StatusCodes.ts
│   │   │   │   ├── error/
│   │   │   │   │   ├── __specs__/
│   │   │   │   │   │   └── index.spec.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── success/
│   │   │   │   │   └── index.ts
│   │   │   │   └── response-log.ts
│   │   │   ├── interfaces/
│   │   │   │   ├── CacheManager.interface.ts
│   │   │   │   ├── CustomRequest.interface.ts
│   │   │   │   ├── PaginationClient.interface.ts
│   │   │   │   ├── PaginationServer.interface.ts
│   │   │   │   └── rest.interface.ts
│   │   │   └── validateZodSchema/
│   │   │       ├── __tests__/
│   │   │       │   └── validateSchema.spec.ts
│   │   │       ├── index.ts
│   │   │       ├── Pagination.validation.ts
│   │   │       └── Pagnination.dto.ts
│   │   ├── logger/
│   │   │   ├── __tests__/
│   │   │   │   └── simple-logger.spec.ts
│   │   │   └── simple-logger.ts
│   │   ├── middleware/
│   │   │   ├── __specs__/
│   │   │   │   ├── auth.middleware.spec.ts
│   │   │   │   └── displayRequest.middleware.spec.ts
│   │   │   ├── auth.middleware.ts
│   │   │   ├── displayRequest.middleware.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── resourceUsageMiddleware.ts
│   │   │   ├── responseLogger.middleware.ts
│   │   │   └── start-time.middleware.ts
│   │   └── server/
│   │       └── app/
│   │           ├── __tests__/
│   │           │   └── app.spec.ts
│   │           └── app.service.ts
│   ├── modules/
│   │   ├── _base/
│   │   │   └── crud/
│   │   │       ├── __specs__/
│   │   │       │   ├── BaseController.spec.ts
│   │   │       │   ├── BaseRepository.spec.ts
│   │   │       │   └── BaseService.spec.ts
│   │   │       ├── BaseController.ts
│   │   │       ├── BaseRepository.ts
│   │   │       └── BaseService.ts
│   │   ├── contact/
│   │   │   ├── contact.controller.ts
│   │   │   ├── contact.dto.ts
│   │   │   ├── contact.interface.ts
│   │   │   ├── contact.module.ts
│   │   │   ├── contact.repository.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── contact.validation.ts
│   │   │   └── index.ts
│   │   ├── otherModule/
│   │   │   ├── otherModule.controller.ts
│   │   │   ├── otherModule.dto.ts
│   │   │   ├── otherModule.interface.ts
│   │   │   ├── otherModule.module.ts
│   │   │   ├── otherModule.repository.ts
│   │   │   ├── otherModule.service.ts
│   │   │   ├── otherModule.validation.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── types/
│   │   └── express.d.ts
│   └── index.ts
├── .firebaserc
├── .gitignore
├── bun.lockb
├── check-dirs.ts
├── copy-dirs.ts
├── firebase.json
├── index.ts
├── package.json
├── README.md
├── should
├── test.README.md
└── tsconfig.json

```

By following these guidelines, you'll have a scalable and efficient RESTful API ready for production. 🚀

> For detailed code examples, check `src/modules/contact` in your project repository.

**Happy Coding! 🧑‍💻**

📃 License
This project is licensed under the MIT License.
