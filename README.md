# 🚀 NestJS Enterprise Starter

A **production-ready, large-scale NestJS backend starter template** built with clean architecture principles, JWT authentication, Prisma ORM, MySQL, and full Swagger documentation.

> Use this as the foundation for any SaaS, enterprise API, or microservice backend.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture](#-architecture)
4. [Folder Structure](#-folder-structure)
5. [Setup Instructions](#-setup-instructions)
6. [Environment Variables](#-environment-variables)
7. [Database Setup](#-database-setup-prisma--mysql)
8. [Running the Project](#-running-the-project)
9. [API Documentation](#-api-documentation-swagger)
10. [Authentication Flow](#-authentication-flow)
11. [RBAC — Role-Based Access Control](#-rbac--role-based-access-control)
12. [API Response Format](#-api-response-format)
13. [Security Features](#-security-features)
14. [Future Scalability Notes](#-future-scalability-notes)

---

## 📌 Project Overview

This starter provides everything needed to bootstrap a professional, enterprise-grade REST API:

- ✅ Complete **JWT authentication** with access + refresh token rotation
- ✅ **Prisma ORM** with MySQL and typed schema
- ✅ Full **CRUD user module** with pagination
- ✅ **Role-Based Access Control** (USER / ADMIN / SUPER_ADMIN)
- ✅ Global **response transformation** interceptor
- ✅ Global **exception filter** for consistent error responses
- ✅ **Swagger / OpenAPI** documentation with bearer auth
- ✅ **Rate limiting** via `@nestjs/throttler`
- ✅ **DTO validation** with `class-validator`
- ✅ Clean **repository pattern** separating data access from business logic
- ✅ Environment-based configuration with `@nestjs/config`

---

## 🛠 Technology Stack

| Layer              | Technology                          |
|--------------------|-------------------------------------|
| Framework          | NestJS 10                           |
| Language           | TypeScript 5                        |
| ORM                | Prisma 5                            |
| Database           | MySQL 8                             |
| Authentication     | JWT (passport-jwt), bcrypt          |
| Validation         | class-validator, class-transformer  |
| API Docs           | Swagger (OpenAPI 3)                 |
| Rate Limiting      | @nestjs/throttler                   |
| Config Management  | @nestjs/config + Joi                |

---

## 🏗 Architecture

This project follows **Clean Architecture** and **SOLID principles**, organized into distinct layers:

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Layer (Controllers)              │
│   Handles routing, request parsing, response shaping    │
├─────────────────────────────────────────────────────────┤
│                   Service Layer (Services)               │
│   Business logic, orchestration, domain rules            │
├─────────────────────────────────────────────────────────┤
│               Data Access Layer (Repositories)           │
│   Database queries, Prisma interactions                  │
├─────────────────────────────────────────────────────────┤
│                  Database (MySQL via Prisma)              │
└─────────────────────────────────────────────────────────┘
```

### Design Patterns Used

| Pattern              | Implementation                                          |
|----------------------|---------------------------------------------------------|
| Repository Pattern   | `UserRepository` isolates all DB access for User        |
| Dependency Injection | NestJS IoC container wires all providers automatically  |
| DTO Pattern          | `CreateUserDto`, `LoginDto` etc. validate input shapes  |
| Guard Pattern        | `JwtAuthGuard`, `RolesGuard` protect route access       |
| Interceptor Pattern  | `TransformInterceptor` normalizes all responses         |
| Decorator Pattern    | `@Public()`, `@Roles()`, `@CurrentUser()` custom meta   |
| Strategy Pattern     | `JwtStrategy`, `JwtRefreshStrategy` for Passport        |
| Filter Pattern       | `AllExceptionsFilter` for centralized error handling    |

---

## 📁 Folder Structure

```
src/
├── main.ts                          # Bootstrap: Swagger, pipes, guards, CORS
├── app.module.ts                    # Root module — wires everything together
│
├── config/
│   ├── app.config.ts                # Typed config factories (app, jwt, bcrypt, throttle)
│   └── config.validation.ts         # Joi schema for env var validation
│
├── prisma/
│   ├── prisma.service.ts            # PrismaClient wrapper with lifecycle hooks
│   └── prisma.module.ts             # Global Prisma module
│
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # Validates JWT access tokens globally
│   │   ├── jwt-refresh.guard.ts     # Validates JWT refresh tokens
│   │   └── roles.guard.ts           # Enforces @Roles() decorator
│   ├── interceptors/
│   │   ├── transform.interceptor.ts # Wraps all responses in standard envelope
│   │   └── logging.interceptor.ts   # Logs request method, URL, status, duration
│   ├── filters/
│   │   └── all-exceptions.filter.ts # Catches all errors, returns consistent format
│   └── decorators/
│       ├── public.decorator.ts      # @Public() — skips JWT guard
│       ├── roles.decorator.ts       # @Roles(...) — sets required roles
│       └── current-user.decorator.ts # @CurrentUser() — injects authenticated user
│
├── modules/
│   ├── auth/
│   │   ├── dto/auth.dto.ts          # RegisterDto, LoginDto, RefreshTokenDto
│   │   ├── interfaces/
│   │   │   └── jwt-payload.interface.ts  # JwtPayload, AuthTokens types
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts      # Validates access token, loads user from DB
│   │   │   └── jwt-refresh.strategy.ts  # Validates refresh token
│   │   ├── auth.service.ts          # register, login, refreshTokens, logout
│   │   ├── auth.controller.ts       # /auth/register, /login, /refresh, /logout
│   │   └── auth.module.ts
│   │
│   └── user/
│       ├── dto/user.dto.ts          # CreateUserDto, UpdateUserDto, UserResponseDto
│       ├── user.repository.ts       # All Prisma queries for User model
│       ├── user.service.ts          # CRUD business logic
│       ├── user.controller.ts       # /users CRUD endpoints
│       └── user.module.ts
│
└── utils/
    ├── hash.util.ts                 # bcrypt hash/compare helpers
    └── pagination.util.ts           # Pagination metadata builder

prisma/
├── schema.prisma                    # Prisma schema (User model, enums)
└── seed.ts                          # Database seeder (admin + demo user)
```

---

## ⚙️ Setup Instructions

### Prerequisites

Make sure you have the following installed:

- **Node.js** v18+ (LTS recommended)
- **npm** v9+ or **yarn**
- **MySQL** 8.0+ running locally or accessible remotely

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/nestjs-enterprise-starter.git
cd nestjs-enterprise-starter
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Then edit `.env` with your values (see [Environment Variables](#-environment-variables)).

### 4. Set Up the Database

```bash
# Generate the Prisma client
npm run prisma:generate

# Run migrations (creates tables in your MySQL database)
npm run prisma:migrate

# (Optional) Seed the database with demo users
npm run prisma:seed
```

### 5. Start the Application

```bash
# Development (hot-reload)
npm run start:dev

# Production
npm run build && npm run start:prod
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in all required values:

```dotenv
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# MySQL Database
DATABASE_URL="mysql://root:password@localhost:3306/nestjs_db"

# JWT — use strong random secrets in production (min 32 chars)
JWT_ACCESS_SECRET=your_super_secret_access_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt — higher = more secure but slower (10–14 is practical)
BCRYPT_SALT_ROUNDS=12

# Rate Limiting
THROTTLE_TTL=60000       # Time window in ms
THROTTLE_LIMIT=100       # Max requests per window

# CORS
CORS_ORIGIN=http://localhost:3000
```

> ⚠️ **Never commit your `.env` file.** It is excluded via `.gitignore`.

---

## 🗄 Database Setup (Prisma + MySQL)

### Create a MySQL database

```sql
CREATE DATABASE nestjs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Prisma Workflow

```bash
# Generate Prisma Client after schema changes
npm run prisma:generate

# Create and apply a new migration
npm run prisma:migrate

# Apply migrations in production (no prompt)
npm run prisma:migrate:prod

# Open Prisma Studio (visual DB browser)
npm run prisma:studio

# Seed demo data
npm run prisma:seed
```

### User Model Schema

The `User` model includes:

| Field         | Type        | Description                          |
|---------------|-------------|--------------------------------------|
| id            | Int (PK)    | Auto-increment primary key           |
| email         | String      | Unique email address                 |
| username      | String      | Unique username                      |
| password      | String      | Bcrypt-hashed password               |
| firstName     | String?     | Optional first name                  |
| lastName      | String?     | Optional last name                   |
| role          | Role enum   | USER / ADMIN / SUPER_ADMIN           |
| status        | UserStatus  | ACTIVE / INACTIVE / BANNED           |
| refreshToken  | String?     | Bcrypt-hashed refresh token          |
| createdAt     | DateTime    | Auto-set on creation                 |
| updatedAt     | DateTime    | Auto-updated on every change         |
| lastLoginAt   | DateTime?   | Updated on each successful login     |

---

## ▶️ Running the Project

```bash
# Development with hot-reload
npm run start:dev

# Debug mode
npm run start:debug

# Production build + run
npm run build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

---

## 📚 API Documentation (Swagger)

When running in **development mode**, Swagger UI is available at:

```
http://localhost:3000/docs
```

### Authenticating in Swagger

1. Call `POST /api/v1/auth/login` with your credentials
2. Copy the `accessToken` from the response
3. Click the **Authorize** button (top right)
4. Enter: `Bearer <your_accessToken>`
5. All protected endpoints are now accessible

---

## 🔑 Authentication Flow

```
┌──────────┐        POST /auth/register         ┌─────────────┐
│  Client  │ ─────────────────────────────────► │   Server    │
│          │ ◄─────────────────────────────────  │  Creates    │
│          │   { user: { id, email, role } }     │  User in DB │
│          │                                     └─────────────┘
│          │
│          │        POST /auth/login             ┌──────────────────────┐
│          │ ─────────────────────────────────► │  Validates password  │
│          │ ◄─────────────────────────────────  │  Issues token pair   │
│          │   { accessToken, refreshToken }     │  Stores hashed RT    │
│          │                                     └──────────────────────┘
│          │
│          │   GET /users/me                     ┌──────────────────────┐
│          │   Authorization: Bearer <AT>  ────► │  JwtStrategy         │
│          │ ◄──────────────────────────────     │  Validates AT        │
│          │   { user profile }                  │  Returns user data   │
│          │                                     └──────────────────────┘
│          │
│          │   POST /auth/refresh                ┌──────────────────────┐
│          │   { refreshToken: "..." }     ────► │  JwtRefreshStrategy  │
│          │ ◄──────────────────────────────     │  Verifies RT hash    │
│          │   { accessToken, refreshToken }     │  Rotates token pair  │
│          │                                     └──────────────────────┘
│          │
│          │   POST /auth/logout                 ┌──────────────────────┐
│          │   Authorization: Bearer <AT>  ────► │  Nullifies RT in DB  │
│          │ ◄──────────────────────────────     │  Session invalidated │
└──────────┘   { message: "Logged out" }         └──────────────────────┘
```

### Security Details

- **Access Token**: Short-lived (15 min), stateless JWT. Validated by `JwtStrategy`.
- **Refresh Token**: Long-lived (7 days), stored as **bcrypt hash** in the database. Validated by `JwtRefreshStrategy`.
- **Token Rotation**: Each refresh call invalidates the old refresh token and issues a new pair.
- **Logout**: Sets `refreshToken = null` in the database, invalidating the session server-side.
- **Passwords**: Always hashed with bcrypt (configurable salt rounds).

---

## 🛡 RBAC — Role-Based Access Control

Three roles are supported:

| Role        | Description                       |
|-------------|-----------------------------------|
| USER        | Default role. Limited access.     |
| ADMIN       | Can manage users.                 |
| SUPER_ADMIN | Full access including deletion.   |

### Usage

```typescript
// Require specific roles on a route
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Get()
findAll() { ... }

// Make a route public (bypasses JwtAuthGuard)
@Public()
@Get('health')
health() { ... }

// Inject the authenticated user
@Get('me')
getMe(@CurrentUser() user: JwtPayload) { ... }

// Inject only a specific field
@Get('profile')
getProfile(@CurrentUser('id') userId: number) { ... }
```

---

## 📦 API Response Format

### Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

### Error Response

```json
{
  "success": false,
  "statusCode": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired access token",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/users/me"
}
```

### Paginated Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": {
    "data": [ { ...user }, { ...user } ],
    "meta": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

## 🔒 Security Features

| Feature                    | Implementation                                          |
|----------------------------|---------------------------------------------------------|
| Password Hashing           | bcrypt with configurable salt rounds (default: 12)      |
| JWT Access Token           | Short-lived, HS256, stateless                           |
| JWT Refresh Token          | Stored as bcrypt hash in DB — prevents token theft      |
| Token Rotation             | New refresh token issued on every refresh call          |
| Helmet (recommended)       | Add `helmet` package for HTTP security headers          |
| Rate Limiting              | `@nestjs/throttler` limits requests per IP window       |
| Input Validation           | `class-validator` + whitelist strips unknown properties |
| CORS                       | Configurable allowed origins via `CORS_ORIGIN`          |
| Global Auth Guard          | All routes protected by default; use `@Public()` to opt-out |

---

## 🚀 Future Scalability Notes

This starter is designed to scale horizontally and vertically:

### Adding New Modules

Follow the established pattern:

```
src/modules/your-feature/
  ├── dto/your-feature.dto.ts
  ├── your-feature.repository.ts
  ├── your-feature.service.ts
  ├── your-feature.controller.ts
  └── your-feature.module.ts
```

Register the module in `app.module.ts`.

### Recommended Extensions

| Concern               | Recommendation                                      |
|-----------------------|-----------------------------------------------------|
| Caching               | `@nestjs/cache-manager` + Redis                     |
| Queue / Background    | `@nestjs/bull` + Redis                              |
| Email                 | `@nestjs-modules/mailer` + SMTP/SES                 |
| File Uploads          | `@nestjs/multer` + S3/CloudFront                    |
| WebSockets            | `@nestjs/websockets` + Socket.io                    |
| Microservices         | `@nestjs/microservices` + RabbitMQ/Kafka            |
| Health Checks         | `@nestjs/terminus`                                  |
| Metrics               | `@willsoto/nestjs-prometheus`                       |
| Logging               | `nestjs-pino` for structured JSON logs              |
| API Versioning        | `app.enableVersioning({ type: VersioningType.URI })` |
| Multi-tenancy         | Tenant middleware + scoped Prisma client            |

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT secrets (min 64 chars)
- [ ] Set up PM2 or Docker for process management
- [ ] Enable HTTPS (TLS termination at load balancer)
- [ ] Configure a real CORS origin (not `*`)
- [ ] Set up database connection pooling (PgBouncer or Prisma connection limit)
- [ ] Add `helmet` middleware for HTTP security headers
- [ ] Set up centralized logging (Datadog, CloudWatch, or ELK)
- [ ] Configure monitoring and alerting

---

## 📄 License

MIT — free to use as the foundation for any project.
