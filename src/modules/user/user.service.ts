import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from './user.repository';
import { CreateUserDto, UpdateUserDto, PaginationQueryDto } from './dto/user.dto';

/**
 * UserService orchestrates business logic for user management.
 * It delegates data access to UserRepository.
 */
@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateUserDto) {
    // Check uniqueness
    const emailExists = await this.userRepository.exists({ email: dto.email });
    if (emailExists) throw new ConflictException('Email is already registered');

    const usernameExists = await this.userRepository.exists({ username: dto.username });
    if (usernameExists) throw new ConflictException('Username is already taken');

    // Hash password before storing
    const saltRounds = this.configService.get<number>('bcrypt.saltRounds');
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.userRepository.create({
      ...dto,
      password: hashedPassword,
    });

    this.logger.log(`User created via admin: ${dto.email}`);
    return { message: 'User created successfully', data: user };
  }

  async findAll(query: PaginationQueryDto) {
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 10, 100); // max 100 per page

    const result = await this.userRepository.findAll(page, limit);
    return { message: 'Users retrieved successfully', data: result };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findById(id);
    return { message: 'User retrieved successfully', data: user };
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.update(id, dto);
    return { message: 'User updated successfully', data: user };
  }

  async remove(id: number) {
    const user = await this.userRepository.delete(id);
    this.logger.warn(`User deleted: ID ${id}`);
    return { message: 'User deleted successfully', data: user };
  }
}
