import { Injectable } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  constructor(private readonly mailerService: NestMailerService) {}

  async sendWelcomeEmail(to: string, name: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Welcome to Shopie!',
      template: './welcome',
      context: { name },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Reset Your Shopie Password',
      template: './reset-password',
      context: {
        token,
        resetUrl: `https://yourfrontend.com/reset-password?token=${token}`,
      },
    });
  }
}
