import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

function trimString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeEmail(value: unknown): unknown {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export class LoginDto {
  @Transform((params: TransformFnParams) => normalizeEmail(params.value))
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @Transform((params: TransformFnParams) => trimString(params.value))
  @IsString({ message: 'La contraseña es obligatoria' })
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  password: string;
}
