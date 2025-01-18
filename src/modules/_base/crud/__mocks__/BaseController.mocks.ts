import { mock } from 'bun:test';
import type { Mock } from 'bun:test';
import { Response, NextFunction } from 'express';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { FetchPageResult, PaginationOptions } from '@/_core/helper/interfaces/FetchPageResult.interface';
import { HttpStatusCode } from '@/_core/helper/http-status/common/HttpStatusCode';
import { BaseService } from '../BaseService';

export class MockBaseController<
  T extends CreateDTO & { id?: string },
  CreateDTO,
  UpdateDTO
> {
  protected mockService: BaseService<T>;

  constructor(service: BaseService<T>) {
    this.mockService = service;
  }

  create: Mock<(req: CustomRequest<CreateDTO>, res: Response, next: NextFunction) => Promise<any>> = 
    mock(async (req, res, next) => {
      try {
        const inputData: CreateDTO = req.body;
        const entity = await this.mockService.create(inputData as Omit<T, 'id'>);
        
        return {
          success: true,
          message: 'Entity created successfully',
          data: entity,
          metadata: {
            code: HttpStatusCode.CREATED,
            status: 'Created',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`
          }
        };
      } catch (error) {
        next(error);
      }
    });

    createWithId: Mock<(req: CustomRequest<T>, res: Response, next: NextFunction) => Promise<any>> = 
    mock(async (req, res, next) => {
      try {
        const inputData: T = req.body;
        if (!inputData.id) {
          throw new Error('ID is required for createWithId');
        }
        
        const entity = await this.mockService.create(inputData);
        
        return {
          success: true,
          message: 'Entity created successfully with provided ID',
          data: entity,
          metadata: {
            code: HttpStatusCode.CREATED,
            status: 'Created',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`
          }
        };
      } catch (error) {
        next(error);
      }
    });

  getAll: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>> = 
    mock(async (req, res, next) => {
      try {
        const entities = await this.mockService.getAll();
        
        return {
          success: true,
          message: 'Fetched all entities successfully',
          data: entities,
          metadata: {
            code: HttpStatusCode.OK,
            status: 'OK',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`
          }
        };
      } catch (error) {
        next(error);
      }
    });

  getById: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>> = 
    mock(async (req, res, next) => {
      try {
        const { id } = req.params;
        const entity = await this.mockService.getById(id);
        
        return {
          success: true,
          message: 'Fetched entity by ID successfully',
          data: entity,
          metadata: {
            code: HttpStatusCode.OK,
            status: 'OK',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`
          }
        };
      } catch (error) {
        next(error);
      }
    });

  update: Mock<(req: CustomRequest<UpdateDTO>, res: Response, next: NextFunction) => Promise<any>> = 
    mock(async (req, res, next) => {
      try {
        const { id } = req.params;
        const inputData: UpdateDTO = req.body;
        const entity = await this.mockService.update(id, inputData as unknown as Partial<T>);
        
        return {
          success: true,
          message: 'Entity updated successfully',
          data: entity,
          metadata: {
            code: HttpStatusCode.OK,
            status: 'OK',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`
          }
        };
      } catch (error) {
        next(error);
      }
    });

  delete: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>> = 
    mock(async (req, res, next) => {
      try {
        const { id } = req.params;
        await this.mockService.delete(id);
        
        return {
          success: true,
          message: 'Entity deleted successfully',
          metadata: {
            code: HttpStatusCode.OK,
            status: 'OK',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`
          }
        };
      } catch (error) {
        next(error);
      }
    });

  paginator: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>> = 
    mock(async (req, res, next) => {
      try {
        const { page = '1', limit = '10', all = 'false' } = req.query;
        const options: PaginationOptions = {
          page: Number(page),
          limit: Number(limit),
          all: all === 'true',
        };

        const paginationResult: FetchPageResult<T> = await this.mockService.paginator(options);
        
        return {
          success: true,
          message: 'Fetched paginated entities successfully',
          data: paginationResult,
          metadata: {
            code: HttpStatusCode.OK,
            status: 'OK',
            timestamp: new Date().toISOString(),
            responseTime: `${Date.now() - (req.startTime || Date.now())}ms`
          }
        };
      } catch (error) {
        next(error);
      }
    });

  // Helper methods for testing
  _reset(): void {
    this.create.mockClear();
    this.createWithId.mockClear();
    this.getAll.mockClear();
    this.getById.mockClear();
    this.update.mockClear();
    this.delete.mockClear();
    this.paginator.mockClear();
  }
}

// Helper function to create a mocked controller
export function createMockController<
  T extends CreateDTO & { id?: string },
  CreateDTO,
  UpdateDTO
>(service: BaseService<T>): MockBaseController<T, CreateDTO, UpdateDTO> {
  return new MockBaseController<T, CreateDTO, UpdateDTO>(service);
}

// Type helper for mocked controller
export type MockedBaseController<
  T extends CreateDTO & { id?: string },
  CreateDTO,
  UpdateDTO
> = MockBaseController<T, CreateDTO, UpdateDTO> & {
  create: Mock<(req: CustomRequest<CreateDTO>, res: Response, next: NextFunction) => Promise<any>>;
  getAll: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>>;
  getById: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>>;
  update: Mock<(req: CustomRequest<UpdateDTO>, res: Response, next: NextFunction) => Promise<any>>;
  delete: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>>;
  paginator: Mock<(req: CustomRequest, res: Response, next: NextFunction) => Promise<any>>;
};