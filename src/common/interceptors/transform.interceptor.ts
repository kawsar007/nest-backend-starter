import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * TransformInterceptor normalizes all successful API responses
 * into a consistent envelope shape: { success, statusCode, message, data, timestamp, path }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const statusCode =
      context.switchToHttp().getResponse().statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        message: data?.message || 'Request successful',
        data: data?.data !== undefined ? data.data : data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
