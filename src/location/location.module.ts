import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [LocationService, PrismaService],
  controllers: [LocationController],
})
export class LocationModule {}
