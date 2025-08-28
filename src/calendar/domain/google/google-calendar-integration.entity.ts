import { CalendarIntegration } from '../calendar-integration.entity';

export class GoogleCalendarIntegration extends CalendarIntegration {
  constructor(
    id: number,
    userId: number,
    public accessToken: string,
    public refreshToken?: string,
  ) {
    super(id, userId);
  }
}
