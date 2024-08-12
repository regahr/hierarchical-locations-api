import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from './log.service';
import { LogController } from './log.controller';

@Module({
  providers: [LogService, PrismaService],
  controllers: [LogController],
})
export class LogModule {}
