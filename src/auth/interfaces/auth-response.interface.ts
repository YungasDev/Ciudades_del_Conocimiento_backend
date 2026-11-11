import { UserResponse } from '../../users/dto/user-response.dto';

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}
