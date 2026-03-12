import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

// ─────────────────────────────────────────────
// Create User DTO
// ─────────────────────────────────────────────
export class CreateUserDto {
  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'jane_doe' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username may only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must have uppercase, lowercase, number, and special character',
    },
  )
  password: string;

  @ApiProperty({ example: 'Jane', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ enum: Role, default: Role.USER, required: false })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

// ─────────────────────────────────────────────
// Update User DTO (all fields optional)
// ─────────────────────────────────────────────
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {
  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}

// ─────────────────────────────────────────────
// User Response DTO (what's returned to clients)
// ─────────────────────────────────────────────
export class UserResponseDto {
  @ApiProperty() id: number;
  @ApiProperty() email: string;
  @ApiProperty() username: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty({ enum: Role }) role: Role;
  @ApiProperty({ enum: UserStatus }) status: UserStatus;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty() lastLoginAt: Date;
}

// ─────────────────────────────────────────────
// Pagination Query DTO
// ─────────────────────────────────────────────
export class PaginationQueryDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  limit?: number = 10;
}
