import { Controller, Get, Delete, HttpCode } from '@nestjs/common';
import { LogService } from './log.service';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get('database')
  async getAllDatabaseLogs() {
    return this.logService.getAllDatabaseLogs();
  }

  @Delete('database')
  @HttpCode(204) // No content
  async deleteAllDatabaseLogs() {
    await this.logService.deleteAllDatabaseLogs();
  }

  @Get('endpoint')
  async getAllEndpointLogs() {
    return this.logService.getAllEndpointLogs();
  }

  @Delete('endpoint')
  @HttpCode(204) // No content
  async deleteAllEndpointLogs() {
    await this.logService.deleteAllEndpointLogs();
  }
}
