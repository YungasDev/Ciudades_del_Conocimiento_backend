import { IsBoolean } from 'class-validator';

export class PublishActorDto {
  @IsBoolean()
  published: boolean;
}
