export interface PaymentGateway<T, U> {
  create(item: T, user: U): Promise<void>;
}
