import { Role } from '@prisma/client';

/**
 * JwtPayload represents the decoded content of a JWT access token.
 * This is what Passport injects into request.user after token validation.
 */
export interface JwtPayload {
  /** User's database ID */
  sub: number;
  /** User's email */
  email: string;
  /** User's role (used for RBAC) */
  role: Role;
  /** Token type discriminator */
  type: 'access' | 'refresh';
}

/**
 * Tokens returned after successful login or token refresh.
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
