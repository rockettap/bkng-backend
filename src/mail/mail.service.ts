import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'sasha386058@gmail.com',
      pass: 'nkid itpc eamq thuh',
    },
  });

  async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: '"bkng" sasha386058@gmail.com',
      to,
      subject,
      html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
