import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() marks a route as publicly accessible.
 * When applied, JwtAuthGuard will skip authentication for that route.
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
