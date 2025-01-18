# Firebase Emulator Setup Guide

## Prerequisites
- Bun
- Java JDK 11+
- Firebase project

## Quick Start


```
├── src/
│   ├── environment/
│   │   ├── .env.test/

NODE_ENV=test
PORT=3333
HOST=localhost
OPENAI_API_KEY=sk-proj-EGAAmB5Z_RqTTlGPvBqSM1PMiZM7Ii0fSMyBKmBChn_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URI=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxx-default-rtdb.europe-west1.firebasedatabase.app
TEST_VAR=loaded
BASE_API=/api
IP_FRONTEND=192.168.0.21 // change to your IP

#Firebase Config
FIREBASE_API_KEY=AIzaSyCkjEl-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=ai-analyst-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.firebaseapp.com
FIREBASE_PROJECT_ID=ai-analyst-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_STORAGE_BUCKET=ai-analyst-xxxxxxxxxxxxxxxxxxxxxxxxxxxx.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=926xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_APP_ID=1:xxxxxxxxxxxxxxxxxxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxxxxxxxx
FIREBASE_MEASUREMENT_ID=G-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080

```

Install Firebase Tools:
```bash
bun install -g firebase-tools
```

Login to Firebase:
```bash
firebase login
```

Initialize Emulators:
```bash
firebase init emulators
```

## Java Setup

**Install JDK:**
- Download from Oracle's website
- Install JDK 11 or higher

**Set JAVA_HOME:**

Windows:
```bash
setx JAVA_HOME "C:\Program Files\Java\jdk-[version]"
```

macOS/Linux:
```bash
export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-[version].jdk/Contents/Home"
```

Verify:
```bash
java -version
```

## Emulator Configuration

**Which Firebase emulators do you want to set up?**
- Authentication Emulator
- Firestore Emulator

**Selected Emulators:**
- Authentication (Port: 9099)
- Firestore (Port: 8080)
- UI (Port: 4000)

**firebase.json:**
```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## Usage

Start all:
```bash
firebase emulators:start
```

Start specific:
```bash
firebase emulators:start --only auth,firestore
```

## Endpoints
- UI: `http://localhost:4000`
- Auth: `http://localhost:9099`
- Firestore: `http://localhost:8080`

## Troubleshooting

**Check Java:**
```bash
java -version
echo %JAVA_HOME%  # Windows
echo $JAVA_HOME   # Unix
```

**Check Ports:**
```bash
netstat -ano | findstr "PORT"  # Windows
lsof -i :PORT                  # Unix
```

## Tips
- Use consistent ports across team
- Configure for development only
- Check Java requirements
- Monitor emulator UI for debugging

## Test
```
firebase emulators:start --only auth,firestore

bun test
bun test --coverage
```
```
--------------------------------------------------------------------------------|---------|---------|-------------------
File                                                                            | % Funcs | % Lines | Uncovered Line #s
--------------------------------------------------------------------------------|---------|---------|-------------------
All files                                                                       |   86.68 |   93.17 |
 src\_core\auth\__specs__\auth.controller.spec.ts                               |   92.31 |   93.02 | 48-49,54-55,77
 src\_core\auth\__specs__\auth.repository.spec.ts                               |  100.00 |   98.40 | 35,68
 src\_core\auth\__specs__\auth.service.spec.ts                                  |  100.00 |  100.00 | 
 src\_core\auth\auth.controller.ts                                              |   20.00 |    9.90 | 17-24,29-69,74-91,95-118
 src\_core\auth\auth.dto.ts                                                     |  100.00 |  100.00 | 
 src\_core\auth\auth.module.ts                                                  |  100.00 |  100.00 | 
 src\_core\auth\auth.repository.ts                                              |   75.00 |   72.22 | 160-204
 src\_core\auth\auth.service.ts                                                 |  100.00 |  100.00 | 
 src\_core\auth\auth.validation.ts                                              |  100.00 |  100.00 | 
 src\_core\auth\index.ts                                                        |    0.00 |   81.48 | 20-24
 src\_core\config\__specs__\dotenv.config.spec.ts                               |  100.00 |  100.00 | 
 src\_core\config\dotenv.config.ts                                              |   60.00 |   81.25 | 23,39-42,60-63
 src\_core\config\firebase-admin.account.ts                                     |  100.00 |  100.00 | 
 src\_core\database\firebase-admin-sdk\FirestorePaginatorServerSide.ts          |   81.25 |   92.73 | 235-245,258-260,292-293
 src\_core\database\firebase-admin-sdk\index.ts                                 |   66.67 |   72.31 | 43-45,48-49,59-61,64-65,79-80,88-93
 src\_core\database\firebase-client\FirestorePaginatorClientSide.ts             |   90.48 |   90.37 | 298-305,328-340
 src\_core\database\firebase-client\__specs__\FirestorePaginator.spec.ts        |   97.12 |   93.09 | 65-68,98-100,109-110,143-148,150-151,202,204-207,291-292,301,308,331-332,440,524-526
 src\_core\decorators\bind-methods.decorator.ts                                 |  100.00 |  100.00 | 
 src\_core\helper\asyncHandler\__tests__\asyncHandler.spec.ts                   |   81.82 |   94.12 | 13
 src\_core\helper\asyncHandler\index.ts                                         |  100.00 |  100.00 | 
 src\_core\helper\check-system-overload\__tests__\check-system-overload.spec.ts |   90.91 |   93.51 | 12-16
 src\_core\helper\check-system-overload\check-system-overload.ts                |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\HttpStatusCode.ts                          |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\StatusCodes.ts                             |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\__tests__\createPagination.spec.ts         |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\api-config.ts                              |   50.00 |   94.12 | 98,102-105
 src\_core\helper\http-status\common\create-pagination.ts                       |  100.00 |  100.00 | 
 src\_core\helper\http-status\error\__specs__\index.spec.ts                     |  100.00 |  100.00 | 
 src\_core\helper\http-status\error\index.ts                                    |   32.08 |   67.08 | 52-55,59-60,64-65,69-70,80-81,85-86,219-222,238-241,247-250,256-259,265-268,274-277,283-286,301-304,310-313,318-321,327-330,336-339,345-348,354-357,363-366,372-375,381-384,390-393,399-402,407-410,416-419,425-428,434-437,443-446,453-456,462-465,471-474,480-483,488-491,497-500
 src\_core\helper\http-status\response-log.ts                                   |  100.00 |   82.35 | 29-30,67,69-72,83-84
 src\_core\helper\http-status\success\index.ts                                  |   33.33 |   42.82 | 60-63,70-71,78-79,86-87,94-96,103-129,134,141-142,291-309,314-332,338-356,362-380,386-404,409-427,432-450,456-474
 src\_core\helper\validateZodSchema\Pagination.validation.ts                    |    0.00 |  100.00 | 
 src\_core\helper\validateZodSchema\Pagnination.dto.ts                          |  100.00 |  100.00 | 
 src\_core\helper\validateZodSchema\__tests__\validateSchema.spec.ts            |   85.71 |  100.00 | 
 src\_core\helper\validateZodSchema\index.ts                                    |  100.00 |  100.00 | 
 src\_core\logger\__tests__\simple-logger.spec.ts                               |  100.00 |  100.00 | 
 src\_core\logger\simple-logger.ts                                              |  100.00 |  100.00 | 
 src\_core\middleware\__specs__\auth.middleware.spec.ts                         |   89.29 |  100.00 | 
 src\_core\middleware\__specs__\displayRequest.middleware.spec.ts               |   90.00 |   93.06 | 6-8,47
 src\_core\middleware\auth.middleware.ts                                        |  100.00 |   94.44 | 9-10
 src\_core\middleware\displayRequest.middleware.ts                              |  100.00 |  100.00 | 
 src\_core\middleware\errorHandler.ts                                           |  100.00 |   86.21 | 21,32-34
 src\_core\middleware\responseLogger.middleware.ts                              |  100.00 |  100.00 | 
 src\_core\middleware\start-time.middleware.ts                                  |  100.00 |  100.00 | 
 src\_core\server\app\__tests__\app.spec.ts                                     |  100.00 |   97.06 | 33,38-39
 src\_core\server\app\app.service.ts                                            |   72.22 |   84.27 | 104-112,199,213-214,218-220,228-240
 src\modules\_base\crud\BaseController.ts                                       |  100.00 |  100.00 | 
 src\modules\_base\crud\BaseRepository.ts                                       |  100.00 |  100.00 | 
 src\modules\_base\crud\BaseService.ts                                          |  100.00 |  100.00 | 
 src\modules\_base\crud\__specs__\BaseController.spec.ts                        |   94.29 |   94.85 | 45,49,53,57-66,70,74-83
 src\modules\_base\crud\__specs__\BaseRepository.spec.ts                        |   98.15 |  100.00 | 
 src\modules\_base\crud\__specs__\BaseService.spec.ts                           |  100.00 |  100.00 | 
 src\modules\contact\contact.controller.ts                                      |  100.00 |  100.00 | 
 src\modules\contact\contact.dto.ts                                             |  100.00 |  100.00 | 
 src\modules\contact\contact.module.ts                                          |  100.00 |  100.00 | 
 src\modules\contact\contact.repository.ts                                      |  100.00 |  100.00 | 
 src\modules\contact\contact.service.ts                                         |  100.00 |  100.00 | 
 src\modules\contact\contact.validation.ts                                      |  100.00 |  100.00 | 
 src\modules\contact\index.ts                                                   |    0.00 |   81.48 | 19-23
 src\modules\index.ts                                                           |  100.00 |  100.00 | 
--------------------------------------------------------------------------------|---------|---------|-------------------

 138 pass
 0 fail
 467 expect() calls
Ran 138 tests across 17 files. [19.53s]
```

