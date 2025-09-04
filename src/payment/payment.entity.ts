import { PaymentStatus } from './payment-status.enum';

export class Payment {
  constructor(
    public readonly id: number,
    public readonly amount: number,
    private _status: PaymentStatus = PaymentStatus.PENDING,
  ) {}

  get status(): PaymentStatus {
    return this._status;
  }

  confirm() {
    this._status = PaymentStatus.CONFIRMED;
  }

  cancel() {
    this._status = PaymentStatus.CANCELLED;
  }
}
