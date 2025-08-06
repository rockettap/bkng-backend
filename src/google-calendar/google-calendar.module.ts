import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController as GoogleCalendarController } from './google-calendar.controller';

@Module({
  imports: [UsersModule, AuthModule],
  providers: [GoogleCalendarService],
  controllers: [GoogleCalendarController],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
