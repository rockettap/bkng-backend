import { CalendarIntegration } from '../calendar-integration.entity';

export class GoogleCalendarIntegration extends CalendarIntegration {
  constructor(
    id: number,
    sellerId: number,
    public accessToken: string,
    public refreshToken?: string,
  ) {
    super(id, sellerId);
  }
}
