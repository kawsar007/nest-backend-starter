import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, PaginationQueryDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─────────────────────────────────────────────
  // POST /users — Admin only
  // ─────────────────────────────────────────────
  @Post()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email or username already exists' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  // ─────────────────────────────────────────────
  // GET /users — Admin only
  // ─────────────────────────────────────────────
  @Get()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get paginated list of all users (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.userService.findAll(query);
  }

  // ─────────────────────────────────────────────
  // GET /users/me — Current authenticated user
  // ─────────────────────────────────────────────
  @Get('me')
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  getMe(@CurrentUser('id') userId: number) {
    return this.userService.findOne(userId);
  }

  // ─────────────────────────────────────────────
  // GET /users/:id
  // ─────────────────────────────────────────────
  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get a specific user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // ─────────────────────────────────────────────
  // PATCH /users/:id
  // ─────────────────────────────────────────────
  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a user by ID (Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(id, dto);
  }

  // ─────────────────────────────────────────────
  // DELETE /users/:id
  // ─────────────────────────────────────────────
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user by ID (Super Admin only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
