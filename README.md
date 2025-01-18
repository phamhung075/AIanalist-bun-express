# RESTful API Implementation Guide with Node.js, Express.js, and TypeScript
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

```
{
    "success": true,
    "code": 200,
    "message": "Get contact by id successfully",
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
        "timestamp": "2024-12-29T22:50:17.735Z",
        "statusCode": "OK",
        "methode": "GET",
        "path": "/api/contact/yQg9OD4KRTNywa2fHwxN",
        "description": "The request has succeeded.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.3.1"
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


Validation error
```
{
    "success": false,
    "code": 400,
    "message": "Validation Error",
    "errors": [
        {
            "field": "password",
            "message": "Password must be at least 8 characters long"
        },
        {
            "field": "password",
            "message": "Password must contain at least one lowercase letter"
        },
        {
            "field": "password",
            "message": "Password must contain at least one uppercase letter"
        },
        {
            "field": "password",
            "message": "Password must contain at least one special character"
        }
    ],
    "metadata": {
        "timestamp": "2024-12-30T14:36:52.645Z",
        "statusCode": "BAD_REQUEST",
        "description": "The server could not understand the request due to invalid syntax.",
        "documentation": "https://tools.ietf.org/html/rfc7231#section-6.5.1"
    },
    "links": {
        "self": {
            "rel": "self",
            "href": "localhost:3333/api/auth/registre",
            "method": "POST"
        },
        "post-registre": {
            "title": "POST /registre",
            "rel": "post-registre",
            "href": "localhost:3333/registre",
            "method": "POST"
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

```

Directory structure:
└── AIanalist/
    ├── CHANGELOG.md
    ├── jest.config.ts
    ├── jest.setup.ts
    ├── package.json
    ├── query
    ├── readme.md
    ├── src/
    │   ├── __mocks__/
    │   │   ├── contact.firebase.ts
    │   │   ├── express-rate-limit.ts
    │   │   ├── express-route-tracker/
    │   │   │   └── dist.ts
    │   │   ├── firebase-admin.ts
    │   │   └── helmet.ts
    │   ├── _core/
    │   │   ├── auth/
    │   │   │   ├── auth.controller.ts
    │   │   │   ├── auth.dto.ts
    │   │   │   ├── auth.handler.ts
    │   │   │   ├── auth.interface.ts
    │   │   │   ├── auth.module.ts
    │   │   │   ├── auth.repository.ts
    │   │   │   ├── auth.service.ts
    │   │   │   ├── auth.validation.ts
    │   │   │   ├── guards/
    │   │   │   │   └── jwt-auth.guard.ts
    │   │   │   ├── index.ts
    │   │   │   └── strategies/
    │   │   │       └── jwt.strategy.ts
    │   │   ├── config/
    │   │   │   ├── dotenv.config.ts
    │   │   │   └── firebase-admin.account.ts
    │   │   ├── database/
    │   │   │   └── firebase-admin-sdk/
    │   │   │       └── index.ts
    │   │   ├── helper/
    │   │   │   ├── asyncHandler/
    │   │   │   │   ├── __tests__/
    │   │   │   │   │   └── asyncHandler.spec.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── check-nodemon/
    │   │   │   │   ├── __tests__/
    │   │   │   │   │   └── isRunningWithNodemon.spec.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── check-system-overload/
    │   │   │   │   ├── __tests__/
    │   │   │   │   │   └── check-system-overload.spec.ts
    │   │   │   │   └── check-system-overload.ts
    │   │   │   ├── http-status/
    │   │   │   │   ├── common/
    │   │   │   │   │   ├── HttpStatusCode.ts
    │   │   │   │   │   ├── RestHandler.ts
    │   │   │   │   │   ├── StatusCodes.ts
    │   │   │   │   │   ├── __tests__/
    │   │   │   │   │   │   ├── RestHandler.spec.ts
    │   │   │   │   │   │   └── createPagination.spec.ts
    │   │   │   │   │   ├── api-config.ts
    │   │   │   │   │   └── create-pagination.ts
    │   │   │   │   ├── error/
    │   │   │   │   │   └── index.ts
    │   │   │   │   ├── response-log.ts
    │   │   │   │   └── success/
    │   │   │   │       └── index.ts
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
    │   │   │   ├── __tests__/
    │   │   │   │   ├── displayRequest.spec.ts
    │   │   │   │   └── responseLogger.spec.ts
    │   │   │   ├── auth.middleware.ts
    │   │   │   ├── creates-HATEOAS.middleware.txt
    │   │   │   ├── displayRequest.middleware.ts
    │   │   │   └── responseLogger.middleware.ts
    │   │   └── server/
    │   │       ├── app/
    │   │       │   ├── __tests__/
    │   │       │   │   └── app.spec.ts
    │   │       │   └── app.service.ts
    │   │       └── server.ts
    │   ├── modules/
    │   │   ├── _base/
    │   │   │   └── crud/
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
    │   │   ├── index.ts
    │   │   └── trading-economics-new/
    │   │       ├── index.ts
    │   │       ├── trading-economics-new.controller.ts
    │   │       ├── trading-economics-new.dto.ts
    │   │       ├── trading-economics-new.handler.ts
    │   │       ├── trading-economics-new.interface.ts
    │   │       ├── trading-economics-new.module.ts
    │   │       ├── trading-economics-new.repository.ts
    │   │       ├── trading-economics-new.service.ts
    │   │       └── trading-economics-new.validation.ts
    │   ├── scripts/
    │   │   ├── bot/
    │   │   │   ├── fetch-html-background.py
    │   │   │   ├── fetch-html.py
    │   │   │   ├── fetch-single-url-html-background.py
    │   │   │   └── test.py
    │   │   ├── openai/
    │   │   │   ├── analyze_news.py
    │   │   │   ├── ask0.py
    │   │   │   └── config/
    │   │   │       └── aianalist-firebase-adminsdk-8gwkb-09a794ac72.json
    │   │   └── test-path-converter.ts
    │   └── utils/
    │       ├── clean-doublon.ts
    │       ├── fetch-content.ts
    │       ├── firebase-utils.service.ts
    │       ├── get-all-files.ts
    │       ├── get-data.ts
    │       ├── get-latest-file.ts
    │       └── post-data.ts
    └── tsconfig.json

```

By following these guidelines, you'll have a scalable and efficient RESTful API ready for production. 🚀

> For detailed code examples, check `src/modules/contact` in your project repository.

**Happy Coding! 🧑‍💻**


📃 License
This project is licensed under the MIT License.
