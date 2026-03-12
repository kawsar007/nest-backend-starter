import { registerAs } from '@nestjs/config';

/**
 * Application-level configuration
 * Loaded from environment variables via @nestjs/config
 */
export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN || '*',
}));

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));

export const bcryptConfig = registerAs('bcrypt', () => ({
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
}));

export const throttleConfig = registerAs('throttle', () => ({
  ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
  limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
}));
