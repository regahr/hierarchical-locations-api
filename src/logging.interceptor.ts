import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service'; // Adjust the path as needed
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Interceptor for logging HTTP requests and responses, as well as error details.
 * This interceptor logs the request method, URL, status code, duration, and payloads to the database.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Intercepts HTTP requests and responses, logs the details, and handles any errors.
   *
   * @param {ExecutionContext} context - Provides access to the request and response objects.
   * @param {CallHandler} next - The next handler in the chain that processes the request.
   * @returns {Observable<any>} The processed HTTP response or an error, with logging to the database.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip logging for log-related endpoints
    if (!request.url.includes('logs')) {
      const response = context.switchToHttp().getResponse<Response | any>();
      const start = Date.now();
      return next.handle().pipe(
        // Log successful responses
        tap(async (data) => {
          const duration = Date.now() - start;

          await this.prisma.logEndpoint(
            request.method,
            request.url,
            response.statusCode,
            duration,
            { request: request.body, response: data },
          );
        }),
        // Log errors and rethrow the exception
        catchError(async (err) => {
          const duration = Date.now() - start;
          await this.prisma.logEndpoint(
            request.method,
            request.url,
            500,
            duration,
            { error: err.message || 'Unknown error' },
          );
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR); // Re-throw the error after logging
        }),
      );
    }
    return next.handle();
  }
}
