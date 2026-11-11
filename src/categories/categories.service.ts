import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { slugify } from '../common/utils/slug';
import { Post } from '../posts/entities/post.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async listPublic() {
    const categories = await this.categoriesRepository.find({
      order: { order: 'ASC', name: 'ASC' },
    });

    return Promise.all(
      categories.map(async (category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        postCount: await this.postsRepository.count({
          where: {
            categoryId: category.id,
            status: 'PUBLISHED',
            deletedAt: IsNull(),
          },
        }),
      })),
    );
  }

  listAdmin() {
    return this.categoriesRepository.find({
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      name: dto.name.trim(),
      slug: await this.uniqueSlug(dto.name),
      description: dto.description?.trim() ?? null,
      color: dto.color ?? null,
      order: dto.order ?? 0,
    });
    return this.categoriesRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    if (dto.name !== undefined) {
      category.name = dto.name.trim();
      category.slug = await this.uniqueSlug(dto.name, id);
    }
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.color !== undefined) category.color = dto.color;
    if (dto.order !== undefined) category.order = dto.order;

    return this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoriesRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const posts = await this.postsRepository.count({
      where: { categoryId: id },
    });
    if (posts > 0) {
      throw new BadRequestException(
        'No se puede eliminar una categoría con novedades',
      );
    }

    await this.categoriesRepository.remove(category);
    return { ok: true };
  }

  private async uniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = slugify(name) || 'categoria';
    let candidate = base;
    let counter = 2;

    while (true) {
      const existing = await this.categoriesRepository.findOneBy({
        slug: candidate,
      });
      if (!existing || existing.id === excludeId) return candidate;
      candidate = `${base}-${counter++}`;
    }
  }
}
