import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActorsService } from './actors.service';
import { CreateActorDto, UpdateActorDto } from './dto/actor.dto';
import { PublishActorDto } from './dto/publish-actor.dto';

@Controller('admin/actors')
@UseGuards(JwtAuthGuard)
export class AdminActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Get()
  list() {
    return this.actorsService.listAdmin();
  }

  @Post()
  create(@Body() dto: CreateActorDto) {
    return this.actorsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActorDto,
  ) {
    return this.actorsService.update(id, dto);
  }

  @Patch(':id/publish')
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PublishActorDto,
  ) {
    return this.actorsService.publish(id, dto.published);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.actorsService.remove(id);
  }
}
