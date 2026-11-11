import { Controller, Get, Query } from '@nestjs/common';
import { ActorsService } from './actors.service';

@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Get()
  list(@Query('sector') sector?: string) {
    return this.actorsService.listPublic(sector);
  }
}
