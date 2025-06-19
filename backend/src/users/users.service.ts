import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
      constructor(private prisma: PrismaService) {}

async create(dto: CreateUserDto): Promise<UserResponseDto> {
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  const user = await this.prisma.user.create({
    data: {
      ...dto,
      password: hashedPassword,
    },
  });

  const { password, ...result } = user;
  return result;
}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...result } = user;
    return result;
  }

async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
  let dataToUpdate = { ...dto };

  if (dto.password) {
    dataToUpdate.password = await bcrypt.hash(dto.password, 10);
  }

  const user = await this.prisma.user.update({
    where: { id },
    data: dataToUpdate,
  });

  const { password, ...result } = user;
  return result;
}


  async delete(id: string): Promise<{ message: string }> {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
