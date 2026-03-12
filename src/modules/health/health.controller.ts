import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

/**
 * HealthController provides a public endpoint for load balancers,
 * uptime monitors, and orchestration systems (e.g. Kubernetes probes).
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — returns 200 if the service is running' })
  check() {
    return {
      message: 'Service is running',
      data: {
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    };
  }
}
