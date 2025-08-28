import { CalendarIntegrationRepository } from '../calendar-integration-repository.interface';
import { GoogleCalendarIntegration } from './google-calendar-integration.entity';

export interface GoogleCalendarIntegrationRepository
  extends CalendarIntegrationRepository<GoogleCalendarIntegration> {
  update(
    googleCalendarIntegration: GoogleCalendarIntegration,
  ): Promise<GoogleCalendarIntegration>;
}
