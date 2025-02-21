import { createRouter } from 'express-route-tracker';
import ReadPDFService from './ReadPDF.service';
import { readPDFController } from '.';
import { asyncHandler } from '@/_core/helper/asyncHandler';

const router = createRouter(__filename);

router.get('/readPDF', asyncHandler(readPDFController.readPDF));
