import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─────────────────────────────────────────────
  // POST /auth/register
  // ─────────────────────────────────────────────
  @Public()
  @Post('register')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // ─────────────────────────────────────────────
  // POST /auth/login
  // ─────────────────────────────────────────────
  @Public()
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login and receive JWT access + refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // ─────────────────────────────────────────────
  // POST /auth/refresh
  // ─────────────────────────────────────────────
  @Public()
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate JWT tokens using a valid refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refreshTokens(@CurrentUser() user: any) {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }

  // ─────────────────────────────────────────────
  // POST /auth/logout
  // ─────────────────────────────────────────────
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout and invalidate the refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@CurrentUser('id') userId: number) {
    return this.authService.logout(userId);
  }
}
