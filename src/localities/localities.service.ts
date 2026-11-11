import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locality } from './entities/locality.entity';

@Injectable()
export class LocalitiesService {
  constructor(
    @InjectRepository(Locality)
    private readonly localitiesRepository: Repository<Locality>,
  ) {}

  findAllActive(): Promise<Locality[]> {
    return this.localitiesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  findActiveById(id: string): Promise<Locality | null> {
    return this.localitiesRepository.findOne({
      where: { id, isActive: true },
    });
  }
}
