import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  findByIdOrNull(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.findByIdOrNull(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  create(data: CreateUserData): Promise<User> {
    const user = this.usersRepository.create({
      role: 'EDITOR',
      active: true,
      mustChangePassword: false,
      ...data,
    });
    return this.usersRepository.save(user);
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.update(id, {
      passwordHash,
      mustChangePassword: false,
    });
  }

  count(): Promise<number> {
    return this.usersRepository.count();
  }
}
