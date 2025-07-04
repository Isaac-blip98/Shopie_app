import { IsEmail, IsOptional, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  role?: 'ADMIN' | 'CUSTOMER';
}