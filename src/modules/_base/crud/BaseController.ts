import _ERROR from '@/_core/helper/http-status/error';
import _SUCCESS from '@/_core/helper/http-status/success';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { PaginationResult } from '@/_core/helper/interfaces/rest.interface';
import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { BaseService } from './BaseService';
import { PaginationInput } from '@/_core/helper/validateZodSchema/Pagination.validation';
import { PaginationOptions } from '@/_core/helper/interfaces/PaginationServer.interface';

/**
 * Generic Controller Class for CRUD Operations
 */
@Service()
export abstract class BaseController<
	T extends { [key: string]: any },
	CreateDTO = T,
	UpdateDTO = Partial<T>
> {
	constructor(protected service: BaseService<T>) {}

	async create(
		req: CustomRequest<CreateDTO>,
		res: Response,
		_next: NextFunction
	) {
		try {
			const inputData = req.body;
			const entity = await this.service.create(inputData as Omit<T, 'id'>);

			if (!entity) {
				throw new _ERROR.BadRequestError({
					message: 'Creation failed',
				});
			}

			return new _SUCCESS.CreatedSuccess({
				message: 'Entity created successfully',
				data: entity,
			}).send(res, _next);
		} catch (error) {
			_next(error);
		}
	}

	async getAll(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			const pagination: PaginationInput = {
				page: Number(req.query.page) || 1,
				limit: Number(req.query.limit) || 10,
				sort: (req.query.sort as string) || 'createdAt',
				order: (req.query.order as 'asc' | 'desc') || 'desc',
			};

			const results = await this.service.getAll(pagination);

			return new _SUCCESS.OkSuccess({
				message: 'Fetched entities successfully',
				pagination: results,
			}).send(res, _next);
		} catch (error) {
			_next(error);
		}
	}

	async getById(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			const { id } = req.params;
			const entity = await this.service.getById(id);

			if (!entity) {
				throw new _ERROR.NotFoundError({
					message: 'Entity not found',
				});
			}

			return new _SUCCESS.OkSuccess({
				message: 'Fetched entity by ID successfully',
				data: entity,
			}).send(res, _next);
		} catch (error) {
			_next(error);
		}
	}

	async update(
		req: CustomRequest<UpdateDTO>,
		res: Response,
		_next: NextFunction
	) {
		try {
			const { id } = req.params;
			const inputData = req.body;

			const entity = await this.service.update(
				id,
				inputData as unknown as Partial<T>
			);

			if (!entity) {
				throw new _ERROR.NotFoundError({
					message: 'Entity not found',
				});
			}

			return new _SUCCESS.OkSuccess({
				message: 'Entity updated successfully',
				data: entity,
			}).send(res, _next);
		} catch (error) {
			_next(error);
		}
	}

	async delete(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			const { id } = req.params;
			const result = await this.service.delete(id);

			if (!result) {
				throw new _ERROR.NotFoundError({
					message: 'Entity not found',
				});
			}

			return new _SUCCESS.OkSuccess({
				message: 'Entity deleted successfully',
			}).send(res, _next);
		} catch (error) {
			_next(error);
		}
	}

	async paginator(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			const { page = '1', limit = '10', all = 'false' } = req.query;

			const pageNumber = Number(page);
			const limitNumber = Number(limit);

			if (isNaN(pageNumber) || isNaN(limitNumber)) {
				throw new _ERROR.BadRequestError({
					message: 'Invalid page or limit parameters',
				});
			}

			const options: PaginationOptions = {
				page: pageNumber,
				limit: limitNumber,
				all: all === 'true',
			};

			const paginationResult = await this.service.paginator(options);

			return new _SUCCESS.OkSuccess({
				message: 'Fetched paginated entities successfully',
				pagination: paginationResult,
			}).send(res, _next);
		} catch (error) {
			_next(error);
		}
	}
}
