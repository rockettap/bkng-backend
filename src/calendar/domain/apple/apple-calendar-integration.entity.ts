import { CalendarIntegration } from '../calendar-integration.entity';

export class AppleCalendarIntegration extends CalendarIntegration {
  constructor(
    id: number,
    userId: number,
    private _username: string,
    private _password: string,
  ) {
    super(id, userId);
  }

  get username() {
    return this._username;
  }

  get password() {
    return this._password;
  }
}
