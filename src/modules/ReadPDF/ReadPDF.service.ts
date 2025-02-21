import { Service } from 'typedi';

@Service()
class ReadPDFService {
	read(rawdata: any) {
		return 'ok';
	}
}

export default ReadPDFService;
