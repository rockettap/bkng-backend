import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ReminderJob } from './reminder-job.interface';

@Injectable()
export class ReminderService {
  constructor(@InjectQueue('booking-reminder') private queue: Queue) {}

  async scheduleReminder(data: ReminderJob, delayMs: number) {
    await this.queue.add('reminder', data, {
      delay: delayMs,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 240_000,
      },
    });
  }
}
