import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { toUserResponse } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);

    return toUserResponse(user);
  }
}
