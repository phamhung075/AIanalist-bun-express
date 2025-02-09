import { Container } from 'typedi';
import SubscriptionController from './subscription.controller';
import SubscriptionRepository from './subscription.repository';
import SubscriptionService from './subscription.service';

const subscriptionController = Container.get(SubscriptionController);
const subscriptionService = Container.get(SubscriptionService);
const subscriptionRepository = Container.get(SubscriptionRepository);

export { subscriptionController, subscriptionService, subscriptionRepository };
export { default as SubscriptionController } from './subscription.controller';
export { default as SubscriptionRepository } from './subscription.repository';
export { default as SubscriptionService } from './subscription.service';
export type { ISubscription } from './subscription.interface';
