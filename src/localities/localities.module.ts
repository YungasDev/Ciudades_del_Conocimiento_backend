import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Locality } from './entities/locality.entity';
import { LocalitiesController } from './localities.controller';
import { LocalitiesService } from './localities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Locality])],
  controllers: [LocalitiesController],
  providers: [LocalitiesService],
  exports: [LocalitiesService],
})
export class LocalitiesModule {}
