import path from "path";
import type { CustomRequest } from "../interfaces/CustomRequest.interface";
import { getRequest } from "@/_core/middleware/displayRequest.middleware";
import { config } from "@config/dotenv.config";
import fs from "fs";

// Clean up the logDir path by removing quotes and converting to absolute path
const LOGDIR = path.resolve(
  process.cwd(),
  (config.logDir || 'logs').replace(/['"]/g, '') // Add fallback value
);

interface Logger {
  logError: (message: string) => void;
}

interface Logger {
  logError: (message: string) => void;
}

export function createLogger(logDir: string): Logger {
  // Ensure the log directory exists
  fs.mkdirSync(logDir, { recursive: true });
  
  return {
    logError: (message: string) => {
      try {
        fs.appendFileSync(path.join(logDir, 'error-log.txt'), message + '\n', 'utf8');
      } catch (error) {
        console.error('Failed to write to log file:', error);
        // Fallback to console logging if file write fails
        console.error(message);
      }
    }
  };
}

export function createErrorLog<T>(req: CustomRequest<T>, error: any, startTime: number): string {
  const requestLog = getRequest(req);
  const timestamp = new Date().toISOString();
  
  return `
[${timestamp}]
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
  try {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const hour = now.getUTCHours().toString().padStart(2, '0');
    
    const logDir = path.join(LOGDIR, 'error', date, hour);
    
    // Ensure the directory exists
    fs.mkdirSync(logDir, { recursive: true });
    
    return logDir;
  } catch (error) {
    // Fallback to a temporary directory if we can't create the intended path
    const tempDir = path.join(process.cwd(), 'temp-logs');
    fs.mkdirSync(tempDir, { recursive: true });
    console.warn(`Failed to create log directory, falling back to: ${tempDir}`);
    console.error('Original error:', error);
    return tempDir;
  }
}

export function logResponse(req: CustomRequest<any>, response: string) {
  try {
    const logDir = createLogDir();
    console.log(`Logging response to ${logDir}`);
    const logger = createLogger(logDir);
    logger.logError(createErrorLog(req, response, req.startTime || Date.now()));
  } catch (error) {
    console.error('Failed to log response:', error);
    // Ensure errors in logging don't crash the application
    console.error('Response that failed to log:', response);
  }
}