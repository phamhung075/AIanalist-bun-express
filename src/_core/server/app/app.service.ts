import { config, showConfig } from '@config/dotenv.config';
import { startTimeAddOnRequest } from '@core/middleware/start-time.middleware';
import { blue, green, yellow } from 'colorette';
import cors from 'cors'; // Correct way to import
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { checkSystemOverload } from '../../helper/check-system-overload/check-system-overload';
import { SimpleLogger } from '../../logger/simple-logger'; // Assuming SimpleLogger is used for logging

import { errorMiddleware } from '@/_core/middleware/errorHandler';
import router from '@/modules';
import { testFirestoreAccess } from '@database/firebase-admin-sdk';
import { API_CONFIG } from '@helper/http-status/common/api-config';
import { HttpStatusCode } from '@helper/http-status/common/HttpStatusCode';
import { StatusCodes } from '@helper/http-status/common/StatusCodes';
import _ERROR from '@helper/http-status/error';
import { displayRequest } from '@middleware/displayRequest.middleware';
import { responseLogger } from '@middleware/responseLogger.middleware';
import rateLimit from 'express-rate-limit';
import { RouteDisplay } from 'express-route-tracker';
import helmet from 'helmet';
import { validateContentLength } from '@/_core/middleware/validateContentLength.middleware';

const env = config.env;
const pathToEnvFile = path.resolve(
	__dirname,
	`../../../../environment/.env.${env}`
);
const envFile = path.resolve(pathToEnvFile);

// Load environment variables from the .env file
console.log(green(`Loading environment from  ${blue(envFile)}`));
console.log(
	green(
		`All environment variables are ${yellow(
			process.env.TEST_VAR || 'N/A'
		)} on mode ${yellow(process.env.NODE_ENV || 'N/A')}`
	)
);

console.log(showConfig());

/**
 * Service class for managing the server application
 */
export class AppService {
	private static instance: AppService;
	readonly app = express();
	private logger: SimpleLogger = new SimpleLogger();
	private port: number | string = process.env.PORT || 3000;

	constructor() {
		if (AppService.instance) {
			return AppService.instance;
		}
		this.logger = new SimpleLogger();
		AppService.instance = this;
	}

	public static getInstance(): AppService {
		if (!AppService.instance) {
			new AppService();
		}
		return AppService.instance;
	}

	/**
	 * Initialize middleware and settings
	 */
	private async init(): Promise<void> {
		app.use(startTimeAddOnRequest);
		this.setupCors();
		app.use(helmet());
		app.use(
			rateLimit({
				windowMs: 15 * 60 * 1000, // 15 minutes
				max: 100, // limit each IP to 100 requests per windowMs
			})
		);
		this.setupRateLimit();
		this.setupJsonParser();
		app.use(displayRequest);
		app.use(responseLogger);
		// Initialize and display routes after loading all modules
		// app.use(resourceUsageMiddleware); // Add the middleware to your app
		router.use('/', validateContentLength);

		app.use('/', router);
		const routeDisplay = new RouteDisplay(app);
		routeDisplay.displayRoutes();

		// /**
		//  * Handles requests to undefined routes.
		//  */
		app.use(errorMiddleware.notFound);
		app.use(errorMiddleware.errorHandler);

		/**
		 * 🔴 General Error Handling Middleware (4 arguments)
		 * Handles all uncaught errors and returns a consistent response format.
		 */
		app.use((error: any, req: Request, res: Response, _next: NextFunction) => {
			const message =
				error.message ||
				StatusCodes[error.status as unknown as HttpStatusCode].phrase ||
				StatusCodes[HttpStatusCode.INTERNAL_SERVER_ERROR].phrase;

			return new _ERROR.InternalServerError({
				message,
				errors: error.errors || [],
			}).send(res, _next);
		});
	}

	/**
	 * Setup Rate Limiting Middleware
	 */
	setupRateLimit(): void {
		app.use(
			rateLimit({
				windowMs: API_CONFIG.RATE_LIMIT.WINDOW_MS,
				max: API_CONFIG.RATE_LIMIT.MAX_REQUESTS,
				message: 'Too many requests from this IP, please try again later.',
				standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
				legacyHeaders: false, // Disable `X-RateLimit-*` headers
			})
		);
		console.log('✅ Rate limiting configured successfully.');
	}

	/**
	 * Setup JSON Parsing Middleware
	 */
	setupJsonParser(): void {
		app.use(
			express.json({
				limit: API_CONFIG.JSON.LIMIT,
			})
		);
		console.log(`✅ JSON body limit set to ${API_CONFIG.JSON.LIMIT}.`);
	}

	/**
	 * Setup CORS based on environment
	 */
	setupCors(): void {
		const corsOptions = {
			origin: (env === 'development'
				? [...API_CONFIG.CORS.ORIGINS.DEVELOPMENT] // Convert readonly to mutable array
				: [...API_CONFIG.CORS.ORIGINS.PRODUCTION]) as string[], // Explicitly cast to string[]
			allowedHeaders: [...API_CONFIG.CORS.ALLOWED_HEADERS], // Convert readonly to mutable array
			exposedHeaders: [...API_CONFIG.CORS.EXPOSED_HEADERS],
			methods: [...API_CONFIG.CORS.METHODS], // Convert readonly to mutable array
			credentials: API_CONFIG.CORS.CREDENTIALS,
		};

		app.use(cors(corsOptions));
		console.log(`✅ CORS configured for ${env} environment.`);
	}

	/**
	 * Create and configure the server (HTTP or HTTPS)
	 */
	private async createServer(): Promise<http.Server | https.Server> {
		let server: http.Server | https.Server;

		if (process.env.HTTPS !== 'true' || env === 'test') {
			// Use HTTP for non-HTTPS environments or test environment
			server = http.createServer(app);
		} else {
			// Use HTTPS for production or other environments where HTTPS is enabled
			try {
				// SSL certificate paths for production
				const privateKeyPath = '/var/keys/privkey.pem';
				const certificatePath = '/var/keys/fullchain.pem';

				const credentials = {
					key: fs.readFileSync(privateKeyPath, 'utf8'),
					cert: fs.readFileSync(certificatePath, 'utf8'),
				};

				server = https.createServer(credentials, app);
			} catch (error: any) {
				this.logger.error('Failed to read SSL certificates:', error);
				throw new Error(
					'Failed to set up HTTPS server. Check SSL certificate paths.'
				);
			}
		}

		// Wrap the listen call with error handling
		server
			.listen(this.port)
			.on('listening', () => {
				this.logger.info(`Server started on port ${this.port} in ${env} mode`);
			})
			.on('error', (error: NodeJS.ErrnoException) => {
				this.handleServerError(error, server);
			});

		this.setupGlobalErrorHandlers();
		this.logger.info('Global error handlers configured');

		return server;
	}

	/**
	 * Setup global error handlers for uncaught exceptions and rejections
	 */
	private setupGlobalErrorHandlers(): void {
		process.on('uncaughtException', (error) => {
			this.logger.error('Uncaught Exception', error);
			process.exit(1);
		});

		process.on('unhandledRejection', (reason: unknown) => {
			const error =
				reason instanceof Error ? reason : new Error(String(reason));
			this.logger.error('Unhandled Rejection', error);
		});
	}

	/**
	 * Handle server errors such as 'EADDRINUSE'
	 */
	private handleServerError(
		error: NodeJS.ErrnoException,
		server: http.Server | https.Server
	): void {
		if (error.code === 'EADDRINUSE') {
			this.logger.error(
				`Port ${this.port} is already in use. Retrying on another port...`,
				error
			);
			// Retry with a random port
			server.listen(0); // 0 means it will assign an available random port
		} else {
			this.logger.error('Error occurred while starting the server:', error);
			throw error;
		}
	}

	/**
	 * Start listening for connections
	 */
	async listen(): Promise<http.Server | https.Server> {
		try {
			await this.init();
			await testFirestoreAccess();

			const server = await this.createServer();
			console.log('Server is now listening for connections');
			if (config.env == 'production') checkSystemOverload();

			return server;
		} catch (error) {
			this.logger.error('Failed to start server', error as Error);
			throw error;
		}
	}
}

// Initialize the AppService and start the server
const appService = AppService.getInstance();
const app = appService.app; // Export the Express app for testing
export { app, appService };
