import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, User, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

// Fields that are safe to return to clients (excludes password & refresh token)
const USER_SELECT_FIELDS = {
  id: true,
  email: true,
  username: true,
  firstName: true,
  lastName: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} as const;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * UserRepository encapsulates all database access for the User entity.
 * Services interact with this repository instead of PrismaService directly,
 * keeping the data-access layer isolated and easily testable.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<Partial<User>> {
    return this.prisma.user.create({
      data,
      select: USER_SELECT_FIELDS,
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Partial<User>>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: USER_SELECT_FIELDS,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT_FIELDS,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByUsername(username: string): Promise<Partial<User> | null> {
    return this.prisma.user.findUnique({
      where: { username },
      select: USER_SELECT_FIELDS,
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput): Promise<Partial<User>> {
    await this.findById(id); // Ensures 404 if not found

    return this.prisma.user.update({
      where: { id },
      data,
      select: USER_SELECT_FIELDS,
    });
  }

  async delete(id: number): Promise<Partial<User>> {
    await this.findById(id); // Ensures 404 if not found

    return this.prisma.user.delete({
      where: { id },
      select: USER_SELECT_FIELDS,
    });
  }

  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    const user = await this.prisma.user.findFirst({ where });
    return !!user;
  }
}
