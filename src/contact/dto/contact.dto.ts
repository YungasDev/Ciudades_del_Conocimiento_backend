import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail()
  @MaxLength(180)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  organization?: string;

  @IsOptional()
  @IsIn(['GOBIERNO', 'EDUCACION', 'SECTOR_PRIVADO', 'COMUNIDAD', 'OTRO'])
  sector?: string;

  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  message: string;

  @IsBoolean()
  consent: boolean;
}
