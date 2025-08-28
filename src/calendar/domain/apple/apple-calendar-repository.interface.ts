import { CalendarIntegrationRepository } from '../calendar-integration-repository.interface';
import { AppleCalendarIntegration } from './apple-calendar-integration.entity';

export type AppleCalendarIntegrationRepository =
  CalendarIntegrationRepository<AppleCalendarIntegration>;
