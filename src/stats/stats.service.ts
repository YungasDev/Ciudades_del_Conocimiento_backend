import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThanOrEqual, Repository } from 'typeorm';
import { Actor } from '../actors/entities/actor.entity';
import { Category } from '../categories/entities/category.entity';
import { ContactMessage } from '../contact/entities/contact-message.entity';
import { Event } from '../events/entities/event.entity';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Actor)
    private readonly actorsRepository: Repository<Actor>,
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(ContactMessage)
    private readonly messagesRepository: Repository<ContactMessage>,
  ) {}

  async get() {
    const now = new Date();
    const [
      published,
      drafts,
      archived,
      categories,
      actorsPublished,
      actorsTotal,
      upcomingEvents,
      unreadMessages,
    ] = await Promise.all([
      this.postsRepository.count({
        where: { status: 'PUBLISHED', deletedAt: IsNull() },
      }),
      this.postsRepository.count({
        where: { status: 'DRAFT', deletedAt: IsNull() },
      }),
      this.postsRepository.count({
        where: { status: 'ARCHIVED', deletedAt: IsNull() },
      }),
      this.categoriesRepository.count(),
      this.actorsRepository.count({
        where: { published: true, consent: true, deletedAt: IsNull() },
      }),
      this.actorsRepository.count({ where: { deletedAt: IsNull() } }),
      this.eventsRepository.count({
        where: { published: true, startsAt: MoreThanOrEqual(now) },
      }),
      this.messagesRepository.count({ where: { read: false } }),
    ]);

    return {
      published,
      drafts,
      archived,
      categories,
      actorsPublished,
      actorsTotal,
      upcomingEvents,
      unreadMessages,
    };
  }
}
