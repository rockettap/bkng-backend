import { Email } from 'src/seller/domain/value-objects/email.vo';

export interface PaymentHandler<T> {
  confirm(entity: T, email?: Email): Promise<void>;
  cancel(entity: T): Promise<void>;
}
