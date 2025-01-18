import 'reflect-metadata'; // Import metadata reflection for TypeDI, 1 time, on top of the app
import { appService } from './_core/server/app/app.service';

appService
	.listen()
	.catch((error) => console.error('Error starting server:', error));
