export interface IBaseInterface {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IAIRequest extends IBaseInterface {
	prompt: string;
	response: string;
	chatId: string;
	temperature: number;
	maxTokens: number;
}

export interface IAIRequestCreate
	extends Omit<IAIRequest, 'id' | 'createdAt' | 'updatedAt'> {}
export interface IAIRequestUpdate extends Partial<IAIRequestCreate> {}

export class AIRequest implements Partial<IAIRequest> {
	id?: string;
	createdAt?: Date;
	updatedAt?: Date;
	prompt?: string;
	response?: string;
	chatId?: string;
	temperature?: number;
	maxTokens?: number;
	[key: string]: any;
}
