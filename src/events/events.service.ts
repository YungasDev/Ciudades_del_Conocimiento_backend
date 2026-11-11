import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../common/utils/slug';
import {
  CreateEventDto,
  UpdateEventDto,
} from './dto/event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async listPublic() {
    const events = await this.eventsRepository.find({
      where: { published: true },
      order: { startsAt: 'ASC' },
    });
    const now = new Date();
    return {
      upcoming: events.filter((event) => new Date(event.startsAt) >= now),
      past: events
        .filter((event) => new Date(event.startsAt) < now)
        .sort(
          (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
        )
        .slice(0, 6),
    };
  }

  listAdmin() {
    return this.eventsRepository.find({ order: { startsAt: 'DESC' } });
  }

  async create(dto: CreateEventDto) {
    const event = this.eventsRepository.create({
      title: dto.title.trim(),
      slug: await this.uniqueSlug(dto.title),
      description: dto.description.trim(),
      startsAt: new Date(dto.startsAt),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      place: dto.place.trim(),
      ctaLabel: dto.ctaLabel ?? null,
      ctaUrl: dto.ctaUrl ?? null,
      published: dto.published ?? true,
    });
    return this.eventsRepository.save(event);
  }

  async update(id: string, dto: UpdateEventDto) {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) throw new NotFoundException('Encuentro no encontrado');

    if (dto.title !== undefined) {
      event.title = dto.title.trim();
      event.slug = await this.uniqueSlug(dto.title, id);
    }
    if (dto.description !== undefined) event.description = dto.description;
    if (dto.startsAt !== undefined) event.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) {
      event.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }
    if (dto.place !== undefined) event.place = dto.place.trim();
    if (dto.ctaLabel !== undefined) event.ctaLabel = dto.ctaLabel;
    if (dto.ctaUrl !== undefined) event.ctaUrl = dto.ctaUrl;
    if (dto.published !== undefined) event.published = dto.published;

    return this.eventsRepository.save(event);
  }

  async remove(id: string) {
    const event = await this.eventsRepository.findOneBy({ id });
    if (!event) throw new NotFoundException('Encuentro no encontrado');
    await this.eventsRepository.remove(event);
    return { ok: true };
  }

  async counts() {
    const upcoming = await this.eventsRepository.count({
      where: { published: true },
    });
    return { total: upcoming };
  }

  private async uniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title) || 'encuentro';
    let candidate = base;
    let counter = 2;

    while (true) {
      const existing = await this.eventsRepository.findOneBy({
        slug: candidate,
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }
}
