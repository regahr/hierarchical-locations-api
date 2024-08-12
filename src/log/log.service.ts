import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllDatabaseLogs() {
    return this.prisma.databaseLog.findMany();
  }

  async deleteAllDatabaseLogs() {
    return this.prisma.databaseLog.deleteMany();
  }

  async getAllEndpointLogs() {
    return this.prisma.endpointLog.findMany();
  }

  async deleteAllEndpointLogs() {
    return this.prisma.endpointLog.deleteMany();
  }
}
