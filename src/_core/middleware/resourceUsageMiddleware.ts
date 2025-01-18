import { Request, Response, NextFunction } from 'express';


export const resourceUsageMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startUsage = process.cpuUsage();
    const startMemory = process.memoryUsage();
    const startTime = Date.now();

    // Hook into the response's finish event
    res.on('finish', () => {
        const endUsage = process.cpuUsage(startUsage); // Get the CPU usage difference
        const endMemory = process.memoryUsage();
        const elapsedTime = Date.now() - startTime;

        console.log(`
            BUN
            Request: ${req.method} ${req.originalUrl}
            Status: ${res.statusCode}
            CPU Usage: 
                User: ${(endUsage.user / 1000).toFixed(2)}ms
                System: ${(endUsage.system / 1000).toFixed(2)}ms
            Memory Usage (Delta):
                RSS: ${((endMemory.rss - startMemory.rss) / 1024 / 1024).toFixed(2)} MB
                Heap Used: ${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)} MB
                Heap Total: ${((endMemory.heapTotal - startMemory.heapTotal) / 1024 / 1024).toFixed(2)} MB
            Total Memory Usage:
                RSS: ${(endMemory.rss / 1024 / 1024).toFixed(2)} MB
                Heap Used: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)} MB
                Heap Total: ${(endMemory.heapTotal / 1024 / 1024).toFixed(2)} MB
            Response Time: ${elapsedTime}ms
        `);
    });

    next();
};

