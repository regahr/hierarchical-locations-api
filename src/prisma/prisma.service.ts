import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();

    // Add middleware for logging queries
    this.$use(async (params, next) => {
      const start = Date.now();
      let result: any;
      let level: 'info' | 'error' = 'info';
      let errorMessage: string | null = null;

      try {
        result = await next(params);
      } catch (error) {
        level = 'error';
        errorMessage = error.message || 'Unknown error'; // Capture the error message
        throw new HttpException(error, HttpStatus.BAD_REQUEST); // Re-throw the error after logging
      } finally {
        const duration = Date.now() - start;

        if (params.model !== 'DatabaseLog' && params.model !== 'EndpointLog') {
          await this.logQuery(
            params.model,
            params.action,
            params.args,
            duration,
            level,
            errorMessage,
          );
        }
      }

      return result;
    });
  }

  async logQuery(
    model: string,
    action: string,
    args: any,
    duration: number,
    level: 'info' | 'error',
    errorMessage: string | null = null,
  ) {
    const logData = {
      level,
      message: `Query ${model}.${action} took ${duration}ms`,
      meta: {
        model,
        action,
        args,
        duration,
        errorMessage,
      },
    };

    await this.logs(logData);
  }

  async logs(logData: { level: string; message: string; meta: any }) {
    await this.databaseLog.create({
      data: {
        level: logData.level,
        message: logData.message,
        meta: logData.meta,
      },
    });
  }

  async logEndpoint(
    method: string,
    url: string,
    status: number,
    responseTime: number,
    meta: any,
  ) {
    console.log(meta);
    await this.endpointLog.create({
      data: {
        method,
        url,
        status,
        responseTime,
        meta,
      },
    });
  }
}
