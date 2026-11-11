import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminActorsController } from './admin-actors.controller';
import { ActorsController } from './actors.controller';
import { ActorsService } from './actors.service';
import { Actor } from './entities/actor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Actor])],
  controllers: [ActorsController, AdminActorsController],
  providers: [ActorsService],
  exports: [ActorsService],
})
export class ActorsModule {}
