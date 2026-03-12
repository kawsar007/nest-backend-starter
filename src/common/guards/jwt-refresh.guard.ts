import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtRefreshGuard validates the refresh token on the /auth/refresh endpoint.
 * Uses the 'jwt-refresh' Passport strategy.
 */
@Injectable()
export class JwtRefreshGuard extends AuthGuard('jwt-refresh') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired refresh token');
    }
    return user;
  }
}
