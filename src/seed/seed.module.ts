import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actor } from '../actors/entities/actor.entity';
import { Category } from '../categories/entities/category.entity';
import { Event } from '../events/entities/event.entity';
import { Media } from '../media/entities/media.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Category, Media, Post, Event, Actor]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
