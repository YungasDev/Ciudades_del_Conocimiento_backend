import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

/**
 * Obtiene el usuario que el guard JWT adjuntó a la solicitud.
 * Solo debe usarse en rutas protegidas con JwtAuthGuard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<{ user: User }>();

    return request.user;
  },
);
