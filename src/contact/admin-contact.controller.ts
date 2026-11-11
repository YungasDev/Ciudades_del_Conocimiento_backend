import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactService } from './contact.service';

@Controller('admin/contact')
@UseGuards(JwtAuthGuard)
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  list() {
    return this.contactService.list();
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactService.markRead(id);
  }
}
