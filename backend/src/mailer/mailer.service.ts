import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to Shopie!',
      template: 'welcome',
      context: { name },
    });
  }

  async sendVerificationCodeEmail(to: string, code: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Your Shopie Password Reset Code',
      template: 'reset-password',
      context: {
        name,
        code,
      },
    });
  }
}
