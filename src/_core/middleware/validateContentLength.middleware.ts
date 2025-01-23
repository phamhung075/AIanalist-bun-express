import type { Request, Response, NextFunction } from 'express';
import _ERROR from '../helper/http-status/error';

export const validateContentLength = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    console.log('Content-Length:', contentLength);
    console.log('Method:', req.method);
    if (req.method === 'GET' && contentLength > 0) {
        throw new _ERROR.BadRequestError({
            message: 'Content-Length header should not be set for GET requests'
        });
    }
};