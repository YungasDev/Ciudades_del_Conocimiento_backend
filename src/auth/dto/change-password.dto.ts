import { Transform, TransformFnParams } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @Transform((params: TransformFnParams) =>
    typeof params.value === 'string' ? params.value : params.value,
  )
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  newPassword: string;
}
