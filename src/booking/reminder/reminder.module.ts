import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail/mail.module';
import { ReminderConsumer } from './reminder.processor';
import { ReminderService } from './reminder.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'booking-reminder',
    }),
    MailModule,
  ],
  providers: [ReminderService, ReminderConsumer],
  exports: [ReminderService],
})
export class ReminderModule {}
