import { addMinutes } from 'date-fns';
import { MailerService } from '@nestjs-modules/mailer';
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

  async register(dto: RegisterDto): Promise<{ message: string; user: UserResponseDto }> {
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

  //   try{
  //   await this.mailerService.sendMail({
  //     to: email,
  //     subject: 'Welcome to Shopie!',
  //     template: './welcome', 
  //     context: {
  //       name,
  //     },
  //   });
  //   console.log(`welcome email sent to ${user.email}`);
  // } catch(err) {
  //   console.error(`email send failed:`, err);
    
  // }
    

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

  async login(dto: LoginDto): Promise<{ access_token: string; user: UserResponseDto }> {
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
  if (!user) {
    throw new NotFoundException('No account with that email found.');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = addMinutes(new Date(), 15); // valid for 15 minutes

  await this.prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // await this.mailerService.sendMail({
  //   to: user.email,
  //   subject: 'Reset your password',
  //   template: './reset-password', // relative to mailer/templates
  //   context: {
  //     name: user.name,
  //     resetLink: `http://localhost:3000/reset-password/${token}`,
  //   },
  // });

  return { message: 'Reset password link sent to your email.' };
}

async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const resetToken = await this.prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    throw new BadRequestException('Invalid or expired token.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await this.prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashedPassword },
  });

  await this.prisma.passwordResetToken.delete({ where: { token } });

  return { message: 'Password has been reset successfully.' };
}

}
