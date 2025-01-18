import path from "path";
import type { CustomRequest } from "../interfaces/CustomRequest.interface.js";
import { getRequest } from "@/_core/middleware/displayRequest.middleware.js";
import { config } from "@config/dotenv.config.js";
import fs from "fs";
// const appDir = path.dirname(require.main?.filename || '');
const logDirRoot = config.logDir;


export function createLogger(logDir: string) {
    return {
        logError: (message: string) => {
            fs.appendFileSync(path.join(logDir, 'error-log.txt'), message + '\n', 'utf8');
        },
        logResponse: (message: string) => {
            fs.appendFileSync(path.join(logDir, 'response-log.txt'), message + '\n', 'utf8');
        }
    };
}

// Error logging format
export function createErrorLog<T>(req: CustomRequest<T>, error: any, startTime: number): string {
    const requestLog = getRequest(req);
    return `
_________________ REQUEST _________________
Request: ${req.method} ${req.originalUrl}
Duration: ${Date.now() - startTime}ms
${requestLog}
_________________ ERROR _________________
Error: ${error instanceof Error ? error.message : String(error)}
Stack: ${error instanceof Error ? error.stack : 'No stack trace available'}
__________________________________________
    `;
}

export function createLogDir(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hour = now.getUTCHours().toString().padStart(2, '0');
    
    // Ensure logDirRoot is defined
    const logDirRoot = process.env.LOG_DIR_ROOT || path.join(__dirname, 'logs');
    
    const logDir = path.join(logDirRoot, 'error', date, hour);
    
    // Ensure the directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    return logDir;
}

export function logResponse(req: CustomRequest<any>, response: string): void {
    const logDir = createLogDir();
    const logFilePath = path.join(logDir, 'response.log');
    
    fs.appendFileSync(logFilePath, `${new Date().toISOString()} - ${response}\n`);
}