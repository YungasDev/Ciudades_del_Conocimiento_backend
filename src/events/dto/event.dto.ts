import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(20)
  description: string;

  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  place: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaLabel?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  ctaUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  place?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ctaLabel?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  ctaUrl?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
