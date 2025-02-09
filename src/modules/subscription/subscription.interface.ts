export interface ISubscription {
	id: string;
	planId: string;
	status: 'active' | 'cancelled' | 'expired' | 'pending';
	startDate: Date;
	endDate: Date;
	lastBillingDate: Date;
	nextBillingDate: Date;
	amount: number;
	currency: string;
	paymentMethod: string;
	autoRenew: boolean;
	cancelReason?: string;
}
