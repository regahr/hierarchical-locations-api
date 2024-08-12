import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

/**
 * Filter to catch and handle HTTP exceptions in the application.
 * This filter formats the exception response and logs the error details.
 */
@Catch(HttpException)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Method to handle caught HTTP exceptions and format the response.
   *
   * @param {HttpException} exception - The caught HTTP exception.
   * @param {ArgumentsHost} host - The host object that provides access to the request and response objects.
   * @returns {Promise<void>} The formatted response is sent back to the client.
   */
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const message =
      exceptionResponse.message || exception.message || 'Internal Server Error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        message,
        ...exceptionResponse.response,
      },
    });
  }
}
