// src/modules/contact/__tests__/contact.route.spec.ts
import { app } from '@/_core/server/app/app.service';
import http from 'http';
import { createRouter } from '@node_modules/express-route-tracker/dist';

jest.mock('express-rate-limit');
jest.mock('helmet'); 
jest.mock('express-route-tracker/dist');
jest.mock('@/_core/database/firebase');

let server: http.Server;

beforeAll((done) => {
 server = app.listen(4000, done);
});

afterAll((done) => {
 server.close(done);
});

describe('Contact Routes', () => {
 beforeEach(() => {
   jest.clearAllMocks();
   require('../index');
   
   const mockRouter = createRouter(__filename);
   expect(mockRouter.post).toBeDefined();
   expect(mockRouter.get).toBeDefined();
   expect(mockRouter.put).toBeDefined();
   expect(mockRouter.delete).toBeDefined();
 });

 it('should have route handlers defined', () => {
   expect(createRouter).toHaveBeenCalledWith(__filename);
 });
});