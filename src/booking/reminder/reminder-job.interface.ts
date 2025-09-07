export interface ReminderJob {
  bookingId: number;
  email: string;
  from: Date;
  to: Date;
  meetLink?: string;
}
