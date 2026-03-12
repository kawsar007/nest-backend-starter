import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

// ─────────────────────────────────────────────
// Register DTO
// ─────────────────────────────────────────────
export class RegisterDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'john_doe', description: 'Unique username (3–30 chars)' })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({ example: 'SecurePass@123', description: 'Password (min 8 chars, must include uppercase, lowercase, number, special char)' })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({ example: 'John', required: false })
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsString()
  @MaxLength(100)
  lastName?: string;
}

// ─────────────────────────────────────────────
// Login DTO
// ─────────────────────────────────────────────
export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// ─────────────────────────────────────────────
// Refresh Token DTO
// ─────────────────────────────────────────────
export class RefreshTokenDto {
  @ApiProperty({ description: 'The JWT refresh token issued during login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
