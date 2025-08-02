import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReminderService } from './reminder.service';
import { ReminderConsumer } from './reminder.processor';
import { MailModule } from 'src/mail/mail.module';

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
