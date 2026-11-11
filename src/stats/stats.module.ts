import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from '../actors/entities/actor.entity';
import { Category } from '../categories/entities/category.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { Event } from '../events/entities/event.entity';
import { Post } from '../posts/entities/post.entity';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Category, Actor, Event, ContactMessage]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
