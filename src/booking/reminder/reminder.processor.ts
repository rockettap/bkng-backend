import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { Job } from 'bullmq';
import { ReminderJob } from './reminder-job.interface';

@Processor('booking-reminder')
export class ReminderConsumer extends WorkerHost {
  private readonly logger = new Logger(ReminderConsumer.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<ReminderJob, any, string>): Promise<any> {
    const { userEmail, from, to } = job.data;

    this.logger.debug(job.data);

    const html = this.renderTemplate('mail', {
      from: this.formatDate(new Date(from)),
      to: this.formatDate(new Date(to)),
    });

    try {
      await this.mailService.sendMail(userEmail, 'Booking reminder', html);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(error.message);
      }
      throw error;
    }

    return {};
  }

  private renderTemplate(templateName: string, data: any): string {
    const templatePath = path.join(
      process.cwd(),
      'templates',
      `${templateName}.hbs`,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    const template = handlebars.compile(templateSource);

    return template(data);
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
