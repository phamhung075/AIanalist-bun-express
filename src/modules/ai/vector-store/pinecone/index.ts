import Container from 'typedi';
import { PineconeService } from './pinecone.service';

const pineconeService = Container.get(PineconeService);

export { pineconeService, PineconeService };
