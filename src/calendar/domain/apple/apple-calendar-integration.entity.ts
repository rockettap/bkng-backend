import { CalendarIntegration } from '../calendar-integration.entity';

export class AppleCalendarIntegration extends CalendarIntegration {
  constructor(
    id: number,
    sellerId: number,
    private _username: string,
    private _password: string,
  ) {
    super(id, sellerId);
  }

  get username() {
    return this._username;
  }

  get password() {
    return this._password;
  }
}
