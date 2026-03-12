import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * @Roles(...roles) restricts a route to users with specific roles.
 * Must be combined with RolesGuard.
 *
 * @example
 * @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 * @Delete(':id')
 * deleteUser() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
