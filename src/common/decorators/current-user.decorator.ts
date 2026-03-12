import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @CurrentUser() extracts the authenticated user from the request object.
 * Optionally accepts a property key to extract a specific field.
 *
 * @example
 * // Get full user object
 * @CurrentUser() user: JwtPayload
 *
 * // Get just the user ID
 * @CurrentUser('sub') userId: number
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
