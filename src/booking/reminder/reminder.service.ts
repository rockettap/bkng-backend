import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { ReminderJob } from './reminder-job.interface';

@Injectable()
export class ReminderService {
  constructor(
    @InjectQueue('booking-reminder') private queue: Queue<ReminderJob>,
  ) {}

  async scheduleReminder(data: ReminderJob, delayMs: number) {
    const jobId = data.bookingId.toString();

    await this.queue.add('reminder', data, {
      jobId,
      delay: delayMs,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 100_000,
      },
    });
  }

  async cancelReminder(bookingId: number) {
    const jobId = bookingId.toString();

    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }
}
