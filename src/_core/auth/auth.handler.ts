import type { Request, Response, NextFunction } from 'express';
import { authController } from './auth.module.js';
import { validateDTO } from '../helper/validateZodSchema/index.js';
import { LoginSchema, RegisterSchema } from './auth.validation.js';


const validateRegisterDTO = validateDTO(RegisterSchema, 'body');
const validateLoginDTO = validateDTO(LoginSchema, 'body');

const registerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validation already happened in middleware
    await authController.register(req, res, next);
  } catch (error) {
    next(error);
  }
};


const loginHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Validation already happened in middleware
    await authController.login(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getCurrentUserHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    await authController.getCurrentUser(req, res, next);
  } catch (error) {
    next(error);
  }
};

const refreshTokenHandler = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    await authController.refreshToken(req, res, next);
  } catch (error) {
    next(error);
  }
};

export {
  validateRegisterDTO,
  validateLoginDTO,
  registerHandler,
  loginHandler,
  getCurrentUserHandler,
  refreshTokenHandler
}