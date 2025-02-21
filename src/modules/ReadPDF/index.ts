import Container from 'typedi';
import ReadPDFService from './ReadPDF.service';
import ReadPDFController from './ReadPDF.controller';

const readPDFService = Container.get(ReadPDFService);
const readPDFController = Container.get(ReadPDFController);

export { readPDFController, readPDFService };
