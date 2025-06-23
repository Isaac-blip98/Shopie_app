import { addMinutes } from 'date-fns';
import { MailerService } from 'src/mailer/mailer.service';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { UserResponseDto } from 'src/users/dtos/user-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly mailerService: MailerService,
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<{ message: string; user: UserResponseDto }> {
    const { email, name, password } = dto;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: 'CUSTOMER',
      },
    });

    try {
      await this.mailerService.sendWelcomeEmail(email, name);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (err) {
      console.error(`Email send failed:`, err);
    }

    const response: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    return {
      message: 'Registration successful',
      user: response,
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: UserResponseDto }> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const response: UserResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: response,
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No account with that email found.');

    const code = Math.floor(100000 + Math.random() * 900000).toString(); 
    const expiresAt = addMinutes(new Date(), 15);

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: code,
        expiresAt,
      },
    });

    await this.mailerService.sendVerificationCodeEmail(
      user.email,
      code,
      user.name,
    );

    return { message: 'Verification code sent to your email.' };
  }

  async resetPassword(
    code: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: code },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired code.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await this.prisma.passwordResetToken.delete({ where: { token: code } });

    return { message: 'Password has been reset successfully.' };
  }
}
