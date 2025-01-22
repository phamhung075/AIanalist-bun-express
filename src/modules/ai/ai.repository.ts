import { Service } from 'typedi';
import { BaseRepository } from '../_base/crud/BaseRepository';
import type { IAIRequest } from './ai.interface';

@Service()
class AIRepository extends BaseRepository<IAIRequest> {
    constructor() {
        super('ai_requests');
    }
}

export default AIRepository;