# Monolith Modular RESTful API HATEOAS Implementation Guide with Bun, Express.js, and TypeScript
(on progress)
## 📚 **Project Foundation and Tools**
- **Node.js & Express.js:** Web server framework for handling HTTP requests.
- **TypeScript:** Strong typing and better development experience.
- **express-route-tracker:** Route management with HATEOAS support.
- **dotenv:** Environment variable management.
- **Firebase:** Database and authentication.

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
### 1. **Router Creation**
- Use `createRouter(__filename)` for defining routes.

**Example:**
```typescript
import { createRouter } from 'express-route-tracker';
import { Router } from 'express';

const router: Router = createRouter(__filename);

router.get('/example', (req, res) => {
  res.json({ message: 'Hello from example route!' });
});

export default router;
```
- Track file sources with `express-route-tracker`.

### 2. **HATEOAS Integration**
- Add `createHATEOASMiddleware` to your routes.

**Example:**
```typescript
import { createHATEOASMiddleware } from 'express-route-tracker';
import { Router } from 'express';

const router: Router = createRouter(__filename);

router.use(createHATEOASMiddleware({
  autoIncludeSameRoute: true,
  baseUrl: '/api',
  includePagination: true,
  customLinks: {
    self: '/api/example',
    docs: '/api/docs'
  }
}));

router.get('/example', (req, res) => {
  res.json({ message: 'Hello with HATEOAS links!' });
});

export default router;
```
- Enable pagination and custom link generation.

### 3. **Module-Based Routes**
- Organize routes in dedicated directories (e.g., `src/modules/contact`).

### 4. **Controllers**
- Handle incoming requests.

**Example:**
```typescript
import { Request, Response } from 'express';
import { RestHandler } from '@/core/helper/http-status/common/RestHandler';

export const getExampleData = (req: Request, res: Response) => {
  try {
    const data = { id: 1, name: 'Sample Data' };
    RestHandler.success(req, res, {
      data,
      message: 'Data retrieved successfully'
    });
  } catch (error) {
    RestHandler.error(req, res, {
      message: 'Failed to retrieve data'
    });
  }
};
```
- Validate data using `validateSchema(CreateContactSchema)`.

### 5. **Services**
- Encapsulate business logic (e.g., `contact.service.ts`).

**Example:**
```typescript
import { firestore } from '@/core/database/firebase';

export class ContactService {
  async getContactById(contactId: string) {
    try {
      const contactRef = firestore.collection('contacts').doc(contactId);
      const doc = await contactRef.get();
      if (!doc.exists) {
        throw new Error('Contact not found');
      }
      return doc.data();
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      throw error;
    }
  }

  async createContact(contactData: any) {
    try {
      const contactRef = await firestore.collection('contacts').add(contactData);
      return { id: contactRef.id, ...contactData };
    } catch (error) {
      console.error('Failed to create contact:', error);
      throw error;
    }
  }
}
```

### 6. **Repositories**
- Abstract data access logic (e.g., `contact.repository.ts`).

### 7. **Response Handling**
- Use `RestHandler.success` for successful responses.
- Use `RestHandler.error` for error responses.

### 8. **Validation**
- Employ **Zod** for schema-based input validation.

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
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.dto.ts
│   │   │   ├── auth.handler.ts
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
│   │   │   └── firebase-admin-sdk/
│   │   │       ├── __specs__/
│   │   │       │   └── firebase-admin-utility.spec.ts
│   │   │       ├── firebase-admin-utility.ts
│   │   │       └── index.ts
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
│   │   │   │   ├── CustomRequest.interface.ts
│   │   │   │   ├── FetchPageResult.interface.ts
│   │   │   │   └── rest.interface.ts
│   │   │   └── validateZodSchema/
│   │   │       ├── __tests__/
│   │   │       │   └── validateSchema.spec.ts
│   │   │       └── index.ts
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
│   │   │       ├── __mocks__/
│   │   │       │   ├── __specs__/
│   │   │       │   │   ├── BaseController.mocks.spec.ts
│   │   │       │   │   ├── BaseRepository.mocks.spec.ts
│   │   │       │   │   └── BaseService.mocks.spec.ts
│   │   │       │   ├── BaseController.mocks.ts
│   │   │       │   ├── BaseRepository.mocks.ts
│   │   │       │   └── BaseService.mocks.ts
│   │   │       ├── __specs__/
│   │   │       │   ├── BaseController.spec.ts
│   │   │       │   ├── BaseRepository.spec.ts
│   │   │       │   └── BaseService.spec.ts
│   │   │       ├── BaseController.ts
│   │   │       ├── BaseRepository.ts
│   │   │       └── BaseService.ts
│   │   ├── contact/
│   │   │   ├── __tests__/
│   │   │   │   ├── contact-controller.spec.ts
│   │   │   │   ├── contact.handle.spec.ts
│   │   │   │   ├── contact.repository.spec.ts
│   │   │   │   ├── contact.route.spec.ts
│   │   │   │   └── contact.service.spec.ts
│   │   │   ├── contact.controller.ts
│   │   │   ├── contact.dto.ts
│   │   │   ├── contact.handler.ts
│   │   │   ├── contact.interface.ts
│   │   │   ├── contact.module.ts
│   │   │   ├── contact.repository.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── contact.validation.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── types/
│   │   └── express.d.ts
│   └── index.ts
├── .gitignore
├── bun.lockb
├── index.ts
├── package.json
├── README.md
└── tsconfig.json

```

By following these guidelines, you'll have a scalable and efficient RESTful API ready for production. 🚀

> For detailed code examples, check `src/modules/contact` in your project repository.

**Happy Coding! 🧑‍💻**


📃 License
This project is licensed under the MIT License.

