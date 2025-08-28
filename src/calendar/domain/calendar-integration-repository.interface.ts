import { Repository } from 'src/common/repository.interface';
import { CalendarIntegration } from './calendar-integration.entity';

export interface CalendarIntegrationRepository<T extends CalendarIntegration>
  extends Repository<T> {
  findByUserId(userId: number): Promise<T | null>;
}
