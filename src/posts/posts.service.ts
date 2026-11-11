import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { slugify } from '../common/utils/slug';
import {
  ChangePostStatusDto,
  CreatePostDto,
  QueryPostsDto,
  UpdatePostDto,
} from './dto/post.dto';
import { Post } from './entities/post.entity';

function toSummary(post: Post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    status: post.status,
    featured: post.featured,
    publishedAt: post.publishedAt,
    coverMediaId: post.coverMediaId,
    categoryId: post.categoryId,
    cover: post.coverMedia
      ? {
          url: post.coverMedia.path,
          alt: post.coverMedia.alt || post.title,
        }
      : null,
    category: post.category
      ? {
          name: post.category.name,
          slug: post.category.slug,
          color: post.category.color,
        }
      : null,
    author: post.author?.name ?? 'Equipo de Comunicación',
  };
}

function toDetail(post: Post) {
  return {
    ...toSummary(post),
    content: post.content,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
  };
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async listPublic(query: QueryPostsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 9));

    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.coverMedia', 'coverMedia')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'PUBLISHED' })
      .andWhere('post.deletedAt IS NULL')
      .andWhere('(post.publishedAt IS NULL OR post.publishedAt <= :now)', {
        now: new Date(),
      });

    if (query.category) {
      qb.andWhere('category.slug = :category', { category: query.category });
    }
    if (query.q?.trim()) {
      qb.andWhere(
        '(LOWER(post.title) LIKE :q OR LOWER(post.excerpt) LIKE :q)',
        { q: `%${query.q.trim().toLowerCase()}%` },
      );
    }

    const [items, total] = await qb
      .orderBy('post.featured', 'DESC')
      .addOrderBy('post.publishedAt', 'DESC')
      .addOrderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items.map(toSummary),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getPublicBySlug(slug: string) {
    const post = await this.postsRepository.findOne({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: IsNull(),
      },
      relations: { category: true, coverMedia: true, author: true },
    });

    if (!post || (post.publishedAt && post.publishedAt > new Date())) {
      throw new NotFoundException('Novedad no encontrada');
    }

    const related = await this.postsRepository.find({
      where: {
        categoryId: post.categoryId,
        status: 'PUBLISHED',
        deletedAt: IsNull(),
      },
      relations: { category: true, coverMedia: true, author: true },
      order: { publishedAt: 'DESC' },
      take: 4,
    });

    return {
      ...toDetail(post),
      related: related
        .filter((item) => item.id !== post.id)
        .slice(0, 3)
        .map(toSummary),
    };
  }

  async listAdmin(query: QueryPostsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));

    const qb = this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.coverMedia', 'coverMedia')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('post.status = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('category.slug = :category', { category: query.category });
    }
    if (query.q?.trim()) {
      qb.andWhere('LOWER(post.title) LIKE :q', {
        q: `%${query.q.trim().toLowerCase()}%`,
      });
    }

    const [items, total] = await qb
      .orderBy('post.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items.map(toSummary),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getAdmin(id: string) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: { category: true, coverMedia: true, author: true },
    });
    if (!post) throw new NotFoundException('Novedad no encontrada');
    return toDetail(post);
  }

  async create(dto: CreatePostDto, user: User) {
    const category = await this.categoriesRepository.findOneBy({
      id: dto.categoryId,
    });
    if (!category) throw new BadRequestException('La categoría no existe');

    const post = this.postsRepository.create({
      title: dto.title.trim(),
      slug: await this.uniqueSlug(dto.title),
      excerpt: dto.excerpt.trim(),
      content: dto.content,
      status: dto.status ?? 'DRAFT',
      featured: dto.featured ?? false,
      publishedAt: this.resolvePublishedAt(dto),
      coverMediaId: dto.coverMediaId ?? null,
      categoryId: dto.categoryId,
      authorId: user.id,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
    });

    const saved = await this.postsRepository.save(post);
    return this.getAdmin(saved.id);
  }

  async update(id: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Novedad no encontrada');

    if (dto.categoryId) {
      const category = await this.categoriesRepository.findOneBy({
        id: dto.categoryId,
      });
      if (!category) throw new BadRequestException('La categoría no existe');
      post.categoryId = dto.categoryId;
    }

    if (dto.title !== undefined) post.title = dto.title.trim();
    if (dto.excerpt !== undefined) post.excerpt = dto.excerpt.trim();
    if (dto.content !== undefined) post.content = dto.content;
    if (dto.status !== undefined) post.status = dto.status;
    if (dto.featured !== undefined) post.featured = dto.featured;
    if (dto.coverMediaId !== undefined) post.coverMediaId = dto.coverMediaId;
    if (dto.seoTitle !== undefined) post.seoTitle = dto.seoTitle;
    if (dto.seoDescription !== undefined) {
      post.seoDescription = dto.seoDescription;
    }
    if (dto.publishedAt !== undefined) {
      post.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    } else if (post.status === 'PUBLISHED' && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await this.postsRepository.save(post);
    return this.getAdmin(id);
  }

  async changeStatus(id: string, dto: ChangePostStatusDto) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Novedad no encontrada');
    post.status = dto.status;
    if (dto.status === 'PUBLISHED' && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    await this.postsRepository.save(post);
    return this.getAdmin(id);
  }

  async remove(id: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) throw new NotFoundException('Novedad no encontrada');
    post.deletedAt = new Date();
    post.status = 'ARCHIVED';
    await this.postsRepository.save(post);
    return { ok: true };
  }

  async counts() {
    const [published, drafts, archived, featured] = await Promise.all([
      this.postsRepository.count({ where: { status: 'PUBLISHED', deletedAt: IsNull() } }),
      this.postsRepository.count({ where: { status: 'DRAFT', deletedAt: IsNull() } }),
      this.postsRepository.count({ where: { status: 'ARCHIVED', deletedAt: IsNull() } }),
      this.postsRepository.count({ where: { featured: true, deletedAt: IsNull() } }),
    ]);
    return { published, drafts, archived, featured };
  }

  private resolvePublishedAt(dto: CreatePostDto): Date | null {
    if (dto.publishedAt) return new Date(dto.publishedAt);
    return dto.status === 'PUBLISHED' ? new Date() : null;
  }

  private async uniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = slugify(title) || 'novedad';
    let candidate = base;
    let counter = 2;

    while (true) {
      const existing = await this.postsRepository.findOneBy({ slug: candidate });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }
}
