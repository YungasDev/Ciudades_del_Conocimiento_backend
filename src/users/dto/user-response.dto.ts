import { User } from '../entities/user.entity';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: Date;
}

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
    createdAt: user.createdAt,
  };
}
