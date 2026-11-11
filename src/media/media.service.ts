import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Repository } from 'typeorm';
import { Actor } from '../actors/entities/actor.entity';
import { Post } from '../posts/entities/post.entity';
import { Media } from './entities/media.entity';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/avif', 'avif'],
]);

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class MediaService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Actor)
    private readonly actorsRepository: Repository<Actor>,
  ) {
    mkdirSync(this.uploadsDir, { recursive: true });
  }

  list() {
    return this.mediaRepository.find({ order: { createdAt: 'DESC' } });
  }

  async upload(file: UploadedFile | undefined, alt: string) {
    if (!file) throw new BadRequestException('Falta el archivo');
    if (!alt?.trim()) {
      throw new BadRequestException(
        'El texto alternativo es obligatorio para accesibilidad',
      );
    }

    const extension = ALLOWED.get(file.mimetype);
    if (!extension) {
      throw new BadRequestException(
        'Formato no permitido. Usá JPG, PNG, WebP o AVIF',
      );
    }
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('La imagen supera los 5 MB');
    }

    const filename = `${Date.now()}-${randomBytes(5).toString('hex')}.${extension}`;
    writeFileSync(join(this.uploadsDir, filename), file.buffer);

    const media = this.mediaRepository.create({
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      alt: alt.trim(),
      path: `/uploads/${filename}`,
      width: null,
      height: null,
    });

    return this.mediaRepository.save(media);
  }

  async remove(id: string) {
    const media = await this.mediaRepository.findOneBy({ id });
    if (!media) throw new NotFoundException('Imagen no encontrada');

    const [posts, actors] = await Promise.all([
      this.postsRepository.count({ where: { coverMediaId: id } }),
      this.actorsRepository.count({ where: { logoMediaId: id } }),
    ]);
    if (posts + actors > 0) {
      throw new BadRequestException(
        'La imagen está en uso por una novedad o institución',
      );
    }

    await this.mediaRepository.remove(media);
    return { ok: true };
  }
}
