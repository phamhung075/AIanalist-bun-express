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
All files                                                                       |   85.58 |   90.67 |
 src\_core\auth\__specs__\auth.repository.spec.ts                               |  100.00 |   97.52 | 49-50
 src\_core\auth\auth.controller.ts                                              |    0.00 |  100.00 | 
 src\_core\auth\auth.module.ts                                                  |  100.00 |  100.00 | 
 src\_core\auth\auth.repository.ts                                              |   75.00 |   72.56 | 158-202
 src\_core\auth\auth.service.ts                                                 |    0.00 |    5.19 | 13-85
 src\_core\config\__specs__\dotenv.config.spec.ts                               |  100.00 |  100.00 | 
 src\_core\config\dotenv.config.ts                                              |   60.00 |   81.25 | 23,39-42,60-63
 src\_core\config\firebase-admin.account.ts                                     |  100.00 |  100.00 | 
 src\_core\database\firebase-admin-sdk\__specs__\firebase-admin-utility.spec.ts |  100.00 |  100.00 | 
 src\_core\database\firebase-admin-sdk\index.ts                                 |   66.67 |   72.31 | 43-45,48-49,59-61,64-65,79-80,88-93
 src\_core\helper\asyncHandler\__tests__\asyncHandler.spec.ts                   |  100.00 |  100.00 | 
 src\_core\helper\asyncHandler\index.ts                                         |  100.00 |   83.33 | 
 src\_core\helper\check-system-overload\__tests__\check-system-overload.spec.ts |   90.91 |   93.51 | 12-16
 src\_core\helper\check-system-overload\check-system-overload.ts                |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\HttpStatusCode.ts                          |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\StatusCodes.ts                             |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\__tests__\createPagination.spec.ts         |  100.00 |  100.00 | 
 src\_core\helper\http-status\common\api-config.ts                              |   50.00 |   94.12 | 98,102-105
 src\_core\helper\http-status\common\create-pagination.ts                       |  100.00 |  100.00 | 
 src\_core\helper\http-status\error\__specs__\index.spec.ts                     |  100.00 |  100.00 | 
 src\_core\helper\http-status\error\index.ts                                    |   32.08 |   67.16 | 52-55,59-60,64-65,69-70,80-81,85-86,219-222,238-241,247-250,256-259,265-268,274-277,283-286,301-304,310-313,318-321,327-330,336-339,345-348,354-357,363-366,372-375,381-384,390-393,399-402,407-410,416-419,425-428,434-437,443-446,453-456,462-465,471-474,480-483,488-491,497-500
 src\_core\helper\http-status\success\index.ts                                  |   37.50 |   43.53 | 59-62,69-70,77-78,85-86,102-128,133,140-141,289-307,312-330,336-354,360-378,384-402,407-425,430-448,454-472
 src\_core\helper\validateZodSchema\__tests__\validateSchema.spec.ts            |  100.00 |  100.00 | 
 src\_core\helper\validateZodSchema\index.ts                                    |  100.00 |  100.00 | 
 src\_core\logger\__tests__\simple-logger.spec.ts                               |  100.00 |  100.00 | 
 src\_core\logger\simple-logger.ts                                              |  100.00 |  100.00 | 
 src\_core\middleware\__specs__\auth.middleware.spec.ts                         |  100.00 |  100.00 | 
 src\_core\middleware\__specs__\displayRequest.middleware.spec.ts               |   90.00 |   93.06 | 6-8,47
 src\_core\middleware\auth.middleware.ts                                        |    0.00 |   17.95 | 10-11,20-23,27-52
 src\_core\middleware\displayRequest.middleware.ts                              |  100.00 |  100.00 | 
 src\_core\middleware\errorHandler.ts                                           |  100.00 |   84.62 | 17,28-30
 src\_core\middleware\responseLogger.middleware.ts                              |  100.00 |  100.00 | 
 src\_core\middleware\start-time.middleware.ts                                  |  100.00 |  100.00 | 
 src\_core\server\app\__tests__\app.spec.ts                                     |  100.00 |   98.91 | 
 src\_core\server\app\app.service.ts                                            |   72.22 |   87.01 | 203-210,293,307-308,312-313,321-327
 src\modules\_base\crud\BaseController.ts                                       |  100.00 |  100.00 | 
 src\modules\_base\crud\BaseRepository.ts                                       |   88.24 |   78.62 | 52-66,201-216
 src\modules\_base\crud\BaseService.ts                                          |  100.00 |  100.00 | 
 src\modules\_base\crud\__specs__\BaseController.spec.ts                        |   84.78 |  100.00 | 
 src\modules\_base\crud\__specs__\BaseRepository.spec.ts                        |  100.00 |  100.00 | 
 src\modules\_base\crud\__specs__\BaseService.spec.ts                           |   89.47 |  100.00 | 
 src\modules\contact\contact.controller.ts                                      |  100.00 |  100.00 | 
 src\modules\contact\contact.module.ts                                          |  100.00 |  100.00 | 
 src\modules\contact\contact.repository.ts                                      |  100.00 |  100.00 | 
 src\modules\contact\contact.service.ts                                         |  100.00 |  100.00 | 
 src\modules\index.ts                                                           |  100.00 |  100.00 | 
--------------------------------------------------------------------------------|---------|---------|-------------------
```

