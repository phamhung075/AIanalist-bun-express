import { BindMethods } from '@/_core/decorators/bind-methods.decorator';
import _ERROR from '@/_core/helper/http-status/error';
import _SUCCESS from '@/_core/helper/http-status/success';
import { CustomRequest } from '@/_core/helper/interfaces/CustomRequest.interface';
import { NextFunction, Response } from 'express';
import { Service } from 'typedi';
import { BaseController } from '../_base/crud/BaseController';
import ReadPDFService from './ReadPDF.service';

@Service()
@BindMethods()
class ReadPDFController {
	constructor(readonly service: ReadPDFService) {}

	async readPDF(req: CustomRequest, res: Response, _next: NextFunction) {
		try {
			console.log(req.user);
			if (!req.user?.uid) {
				throw new _ERROR.UnauthorizedError({ message: 'Unauthorized' });
			}

			const result = req.user;
			const uid = req.user.uid as string;
			const data = await this.service.read(req.body.rawdata);

			if (!data) {
				throw new _ERROR.NotFoundError({
					message: 'data not found',
				});
			}

			return new _SUCCESS.OkSuccess({
				message: 'Fetched entity by ID successfully',
				data: data,
			}).send(res);
		} catch (error) {
			_next(error);
		}
	}
}

export default ReadPDFController;
