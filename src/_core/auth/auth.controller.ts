import type { RequestHandler, Response } from "express";
import _ERROR from "../helper/http-status/error";
import _SUCCESS from "../helper/http-status/success";
import { CustomRequest } from "../helper/interfaces/CustomRequest.interface";
import { getTokenCookies } from "../middleware/auth.middleware";
import { IRegister, IAuth } from "./auth.interface";
import AuthService from "./auth.service";
import { config } from "../config/dotenv.config";


class AuthController {
  constructor(private authService: AuthService) {}

  register: RequestHandler = async (req: CustomRequest, res: Response) => {
    const body = req.body as IRegister;
    const result = await this.authService.register(body);
    new _SUCCESS.CreatedSuccess({
      message: "User registered successfully",
      data: result,
    })
      .setResponseTime(req.startTime)
      .send(res as any);
  };

  
  login: RequestHandler = async (req: CustomRequest, res: Response) => {
    try {
      const { email, password } = req.body as IAuth;
      const result = await this.authService.login(email, password);
      
      // Define secure cookie options
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: req.get('host')?.includes(config.apiFrontend) ? config.apiFrontend : undefined,
        path: '/'
      };

      // Set access token cookie (1 hour expiry)
      res.cookie('idToken', result.idToken, {
        ...cookieOptions,
        maxAge: 3600 * 1000, // 1 heure
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax' | 'strict' | undefined
      });

      // Set refresh token cookie (7 days expiry)
      res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 3600 * 1000, // 7 jours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax' | 'strict' | undefined
      });

      // Send success response
      new _SUCCESS.OkSuccess({
        message: "User logged in successfully",
      })
        .setHeader({
          "Cache-Control": "no-store",
          "Access-Control-Allow-Credentials": "true"
        })
        .setResponseTime(req.startTime)
        .send(res as any);

    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  getCurrentUser: RequestHandler = async (
    req: CustomRequest,
    res: Response
  ) => {
    const cookies = req.cookies;
    console.log('Current cookies:', cookies); // Debug log

    if (!req.user) {
      throw new _ERROR.UnauthorizedError({
        message: "Unauthorized: No user found",
      });
    }
    const result = req.user;
    new _SUCCESS.OkSuccess({
      message: "User fetched successfully",
      data: result,
    })
      .setResponseTime(req.startTime)
      .send(res as any);
  };

  refreshToken: RequestHandler = async (req: CustomRequest, res: Response) => {
    const cookies = req.cookies;
    console.log('Refresh cookies:', cookies); // Debug log

    const { idToken, refreshToken } = getTokenCookies(req);
    console.log("idToken", idToken);
    console.log("refreshToken", refreshToken);

    const result = await this.authService.refreshToken(refreshToken);

    // Set new cookies after refresh
    res.cookie('idToken', result.idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600 * 1000,
      path: '/'
    });

    new _SUCCESS.OkSuccess({
      message: "Token refreshed successfully",
      data: result,
    })
      .setResponseTime(req.startTime)
      .send(res as any);
  };
}

export default AuthController;
