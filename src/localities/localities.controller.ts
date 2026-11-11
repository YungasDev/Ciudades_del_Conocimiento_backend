import { Controller, Get } from '@nestjs/common';
import { LocalitiesService } from './localities.service';

@Controller('localities')
export class LocalitiesController {
  constructor(private readonly localitiesService: LocalitiesService) {}

  @Get()
  findAll() {
    return this.localitiesService.findAllActive();
  }
}
