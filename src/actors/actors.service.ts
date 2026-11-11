import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { slugify } from '../common/utils/slug';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';
import { Actor } from './entities/actor.entity';

function toPublic(actor: Actor) {
  return {
    id: actor.id,
    name: actor.name,
    slug: actor.slug,
    sector: actor.sector,
    description: actor.description,
    websiteUrl: actor.websiteUrl,
    logo: actor.logoMedia
      ? { url: actor.logoMedia.path, alt: actor.logoMedia.alt || actor.name }
      : null,
    order: actor.order,
  };
}

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private readonly actorsRepository: Repository<Actor>,
  ) {}

  async listPublic(sector?: string) {
    const where: Record<string, unknown> = {
      published: true,
      consent: true,
      deletedAt: IsNull(),
    };
    if (sector) where.sector = sector;

    const actors = await this.actorsRepository.find({
      where,
      relations: { logoMedia: true },
      order: { order: 'ASC', name: 'ASC' },
    });

    return actors.map(toPublic);
  }

  listAdmin() {
    return this.actorsRepository.find({
      where: { deletedAt: IsNull() },
      relations: { logoMedia: true },
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async create(dto: CreateActorDto) {
    this.assertConsent(dto.published, dto.consent);

    const actor = this.actorsRepository.create({
      name: dto.name.trim(),
      slug: await this.uniqueSlug(dto.name),
      sector: dto.sector,
      description: dto.description.trim(),
      websiteUrl: dto.websiteUrl ?? null,
      contactEmail: dto.contactEmail ?? null,
      logoMediaId: dto.logoMediaId ?? null,
      published: dto.published ?? false,
      consent: dto.consent ?? false,
      consentAt: dto.consent ? new Date() : null,
      consentNote: dto.consentNote ?? null,
      order: dto.order ?? 0,
    });

    return this.actorsRepository.save(actor);
  }

  async update(id: string, dto: UpdateActorDto) {
    const actor = await this.actorsRepository.findOneBy({ id });
    if (!actor) throw new NotFoundException('Institución no encontrada');

    const published = dto.published ?? actor.published;
    const consent = dto.consent ?? actor.consent;
    this.assertConsent(published, consent);

    if (dto.name !== undefined) {
      actor.name = dto.name.trim();
      actor.slug = await this.uniqueSlug(dto.name, id);
    }
    if (dto.sector !== undefined) actor.sector = dto.sector;
    if (dto.description !== undefined) actor.description = dto.description.trim();
    if (dto.websiteUrl !== undefined) actor.websiteUrl = dto.websiteUrl;
    if (dto.contactEmail !== undefined) actor.contactEmail = dto.contactEmail;
    if (dto.logoMediaId !== undefined) actor.logoMediaId = dto.logoMediaId;
    if (dto.order !== undefined) actor.order = dto.order;
    if (dto.consentNote !== undefined) actor.consentNote = dto.consentNote;

    if (dto.consent === true && !actor.consentAt) {
      actor.consentAt = new Date();
    }
    actor.consent = consent;
    actor.published = published;

    return this.actorsRepository.save(actor);
  }

  async publish(id: string, published: boolean) {
    const actor = await this.actorsRepository.findOneBy({ id });
    if (!actor) throw new NotFoundException('Institución no encontrada');

    if (published && !actor.consent) {
      throw new BadRequestException(
        'No se puede publicar una institución sin consentimiento registrado',
      );
    }

    actor.published = published;
    if (actor.consent && !actor.consentAt) actor.consentAt = new Date();
    return this.actorsRepository.save(actor);
  }

  async remove(id: string) {
    const actor = await this.actorsRepository.findOneBy({ id });
    if (!actor) throw new NotFoundException('Institución no encontrada');
    actor.deletedAt = new Date();
    actor.published = false;
    await this.actorsRepository.save(actor);
    return { ok: true };
  }

  async counts() {
    return {
      published: await this.actorsRepository.count({
        where: { published: true, consent: true, deletedAt: IsNull() },
      }),
      total: await this.actorsRepository.count({
        where: { deletedAt: IsNull() },
      }),
    };
  }

  private assertConsent(published?: boolean, consent?: boolean): void {
    if (published && !consent) {
      throw new BadRequestException(
        'Para publicar una institución primero hay que registrar su consentimiento',
      );
    }
  }

  private async uniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugify(name) || 'institucion';
    let candidate = base;
    let counter = 2;

    while (true) {
      const existing = await this.actorsRepository.findOneBy({
        slug: candidate,
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }
}
