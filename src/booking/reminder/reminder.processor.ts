import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from 'src/mail/mail.service';
import { ReminderJob } from './reminder-job.interface';

@Processor('booking-reminder')
export class ReminderConsumer extends WorkerHost {
  private readonly logger = new Logger(ReminderConsumer.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<ReminderJob, any, string>): Promise<any> {
    const { email, from, to, meetLink } = job.data;

    this.logger.debug(job.data);

    const html = this.mailService.renderTemplate('reminder-mail', {
      from: this.formatDate(new Date(from)),
      to: this.formatDate(new Date(to)),
      meetlink: meetLink,
    });

    try {
      await this.mailService.sendMail(email, 'Booking reminder', html);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }

    return {};
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'GMT',
      timeZoneName: 'short',
    });
  }
}
