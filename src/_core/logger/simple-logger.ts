
import * as path from "path";
import * as fs from "fs";

export class SimpleLogger {
    private logFile: string;
    private fsModule: typeof fs;

    constructor(fsModule = fs) {
        this.fsModule = fsModule;
        const logDir = path.join(__dirname, '../../../logs');
        if (!this.fsModule.existsSync(logDir)) {
            this.fsModule.mkdirSync(logDir, { recursive: true });
        }
        this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    }

    private log(level: string, message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [${level}] ${message} ${meta ? JSON.stringify(meta) : ''}\n`;
        console.log(logMessage.trim());
        this.fsModule.appendFileSync(this.logFile, logMessage);
    }

    info(message: string, meta?: any): void {
        this.log('INFO', message, meta);
    }

    error(message: string, error: Error): void {
        this.log('ERROR', message, {
            error: error.toString() + '\n    ' + error.stack
        });
    }

    warn(message: string, meta?: any): void {
        this.log('WARN', message, meta);
    }

    debug(message: string, meta?: any): void {
        this.log('DEBUG', message, meta);
    }
}