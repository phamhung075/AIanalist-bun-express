import { createRouter } from 'express-route-tracker';
import ReadPDFService from './ReadPDF.service';
import { readPDFController } from '.';
import { asyncHandler } from '@/_core/helper/asyncHandler';

const router = createRouter(__filename);

router.post('/', asyncHandler(readPDFController.readPDF));
export default router;
