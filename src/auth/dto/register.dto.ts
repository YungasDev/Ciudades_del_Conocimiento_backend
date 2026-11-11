import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function normalizeOptionalPhone(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const phone = value.trim();

  return phone === '' ? undefined : phone;
}

export class RegisterDto {
  @Transform((params: TransformFnParams) => trimString(params.value))
  @IsString({ message: 'El nombre es obligatorio' })
  @Length(2, 80, { message: 'El nombre debe tener entre 2 y 80 caracteres' })
  firstName: string;

  @Transform((params: TransformFnParams) => trimString(params.value))
  @IsString({ message: 'El apellido es obligatorio' })
  @Length(2, 80, { message: 'El apellido debe tener entre 2 y 80 caracteres' })
  lastName: string;

  @Transform((params: TransformFnParams) => normalizeEmail(params.value))
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(150, { message: 'El correo electrónico es demasiado largo' })
  email: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, {
    message: 'La contraseña no puede superar los 72 caracteres',
  })
  password: string;

  @IsOptional()
  @Transform((params: TransformFnParams) =>
    normalizeOptionalPhone(params.value),
  )
  @Matches(/^[0-9+()\s-]{6,30}$/, {
    message: 'El teléfono no tiene un formato válido',
  })
  phone?: string;

  @IsUUID('4', { message: 'La localidad no es válida' })
  localityId: string;
}
