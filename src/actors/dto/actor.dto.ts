import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

const SECTORS = ['GOBIERNO', 'EDUCACION', 'SECTOR_PRIVADO', 'COMUNIDAD'] as const;

export class CreateActorDto {
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  name: string;

  @IsIn(SECTORS)
  sector: string;

  @IsString()
  @MinLength(20)
  @MaxLength(800)
  description: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  websiteUrl?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  logoMediaId?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  consentNote?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateActorDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(180)
  name?: string;

  @IsOptional()
  @IsIn(SECTORS)
  sector?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(800)
  description?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  websiteUrl?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  logoMediaId?: string;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsBoolean()
  consent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  consentNote?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}
