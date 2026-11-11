import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryPostsDto } from './dto/post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  list(@Query() query: QueryPostsDto) {
    return this.postsService.listPublic(query);
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.postsService.getPublicBySlug(slug);
  }
}
