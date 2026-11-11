import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import {
  ChangePostStatusDto,
  CreatePostDto,
  QueryPostsDto,
  UpdatePostDto,
} from './dto/post.dto';
import { PostsService } from './posts.service';

@Controller('admin/posts')
@UseGuards(JwtAuthGuard)
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  list(@Query() query: QueryPostsDto) {
    return this.postsService.listAdmin(query);
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.getAdmin(id);
  }

  @Post()
  create(@Body() dto: CreatePostDto, @CurrentUser() user: User) {
    return this.postsService.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  @Patch(':id/status')
  status(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePostStatusDto,
  ) {
    return this.postsService.changeStatus(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.remove(id);
  }
}
