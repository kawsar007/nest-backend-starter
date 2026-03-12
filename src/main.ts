import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port') || 3000;
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';
  const nodeEnv = configService.get<string>('app.nodeEnv');
  const corsOrigin = configService.get<string>('app.corsOrigin');

  // ── CORS ────────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global Prefix ────────────────────────────────────────────
  app.setGlobalPrefix(apiPrefix);

  // ── Global Validation Pipe ───────────────────────────────────
  // Validates all incoming request DTOs using class-validator rules.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true,          // Auto-transform payloads to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Swagger / OpenAPI ────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NestJS Enterprise Starter')
      .setDescription(
        `
## Production-ready NestJS Backend Starter

### Authentication
This API uses **JWT Bearer Token** authentication.
1. Call \`POST /api/v1/auth/login\` to receive an \`accessToken\`
2. Click **Authorize** and enter: \`Bearer <your_accessToken>\`
3. All protected endpoints will now be accessible

### Token Lifecycle
- **Access Token**: Short-lived (15 minutes by default)
- **Refresh Token**: Long-lived (7 days), used to rotate the token pair
      `,
      )
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
        'access-token',
      )
      .addServer(`http://localhost:${port}`, 'Local Development')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`📚 Swagger docs available at: http://localhost:${port}/docs`);
  }

  // ── Graceful Shutdown ────────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
