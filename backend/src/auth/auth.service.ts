import { MailerService } from '@nestjs-modules/mailer';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { UserResponseDto } from 'src/users/dtos/user-response.dto';

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

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Shopie!',
      template: './welcome', 
      context: {
        name,
      },
    });

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
}
