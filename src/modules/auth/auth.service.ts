import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JwtPayload, AuthTokens } from './interfaces/jwt-payload.interface';

/**
 * AuthService handles all authentication business logic:
 * - User registration with password hashing
 * - Login with credential validation
 * - JWT access & refresh token generation
 * - Refresh token rotation (stored as a bcrypt hash)
 * - Logout (invalidates refresh token)
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────
  // Register
  // ─────────────────────────────────────────────
  async register(dto: RegisterDto) {
    // Check for duplicate email or username
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existing) {
      if (existing.email === dto.email) {
        throw new ConflictException('Email is already registered');
      }
      throw new ConflictException('Username is already taken');
    }

    // Hash password
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds');
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    this.logger.log(`New user registered: ${user.email}`);
    return { message: 'Registration successful', data: user };
  }

  // ─────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('Account is suspended or inactive');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token pair
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // Persist hashed refresh token
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        tokens,
      },
    };
  }

  // ─────────────────────────────────────────────
  // Refresh Tokens
  // ─────────────────────────────────────────────
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied — no active session');
    }

    // Compare provided refresh token with stored hash
    const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Rotate tokens (issue new pair)
    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return { message: 'Tokens refreshed', data: tokens };
  }

  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────
  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    this.logger.log(`User logged out: ID ${userId}`);
    return { message: 'Logged out successfully' };
  }

  // ─────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────

  private async generateTokens(
    userId: number,
    email: string,
    role: any,
  ): Promise<AuthTokens> {
    const payload: Partial<JwtPayload> = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...payload, type: 'access' },
        {
          secret: this.configService.get<string>('jwt.accessSecret'),
          expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
        },
      ),
      this.jwtService.signAsync(
        { ...payload, type: 'refresh' },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds');
    const hashedToken = await bcrypt.hash(refreshToken, saltRounds);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedToken },
    });
  }
}
