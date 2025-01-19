import type { Request, Response, NextFunction } from 'express';
import { validateDTO } from '../helper/validateZodSchema';
import { RegisterSchema, LoginSchema } from './auth.validation';
import { authController } from './auth.module';



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