# Firebase Emulator Setup Guide

## Prerequisites
- Bun
- Java JDK 11+
- Firebase project

## Quick Start

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

**Which Firebase emulators do you want to set up? **
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