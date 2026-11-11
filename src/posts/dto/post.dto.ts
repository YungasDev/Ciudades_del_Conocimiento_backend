import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export class CreatePostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(220)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(400)
  excerpt: string;

  @IsString()
  @MinLength(20)
  content: string;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsUUID()
  coverMediaId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoDescription?: string;
}

export class UpdatePostDto extends CreatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(220)
  declare title: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(400)
  declare excerpt: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  declare content: string;

  @IsOptional()
  @IsUUID()
  declare categoryId: string;
}

export class ChangePostStatusDto {
  @IsIn(STATUSES)
  status: string;
}

export class QueryPostsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  page?: string;

  @IsOptional()
  limit?: string;
}
