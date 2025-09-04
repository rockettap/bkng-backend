// import { Inject, Injectable } from '@nestjs/common';
// import { PaymentGateway } from './payment-gateway.interface';
// import { PAYMENT_GATEWAYS } from './tokens';

// @Injectable()
// export class PaymentService {
//   constructor(
//     @Inject(PAYMENT_GATEWAYS)
//     private paymentGateways: Record<string, PaymentGateway<T>>,
//   ) {}

//   async create(method: string, entity: T): Promise<void> {
//     const paymentGateway = this.paymentGateways[method];
//     if (!paymentGateway) {
//       throw new Error();
//     }

//     await paymentGateway.create(entity);
//   }
// }
