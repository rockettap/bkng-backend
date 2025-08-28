export interface ReminderJob {
  bookingId: number;
  userEmail: string;
  from: Date;
  to: Date;
}
