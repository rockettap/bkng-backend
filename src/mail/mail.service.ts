import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

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

  renderTemplate(templateName: string, data: any): string {
    const templatePath = path.join(
      process.cwd(),
      'templates',
      `${templateName}.hbs`,
    );
    const templateSource = fs.readFileSync(templatePath, 'utf8');

    const template = handlebars.compile(templateSource);

    return template(data);
  }
}
