import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

import { appConfig, jwtConfig, bcryptConfig, throttleConfig } from './config/app.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    // ── Configuration ──────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, jwtConfig, bcryptConfig, throttleConfig],
      // Uncomment to enable validation:
      // validationSchema: configValidationSchema,
    }),

    // ── Rate Limiting ──────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl'),
          limit: config.get<number>('throttle.limit'),
        },
      ],
    }),

    // ── Database ───────────────────────────────────────────────
    PrismaModule,

    // ── Feature Modules ────────────────────────────────────────
    AuthModule,
    UserModule,
    HealthModule,
  ],

  providers: [
    // Global JWT guard — protects all routes by default.
    // Use @Public() to exempt specific routes.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global RBAC guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global response transformation
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
