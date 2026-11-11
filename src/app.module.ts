import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ActorsModule } from './actors/actors.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactModule } from './contact/contact.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { MediaModule } from './media/media.module';
import { PostsModule } from './posts/posts.module';
import { SeedModule } from './seed/seed.module';
import { StatsModule } from './stats/stats.module';
import { UsersModule } from './users/users.module';

function databaseOptions(config: ConfigService): TypeOrmModuleOptions {
  const common = {
    autoLoadEntities: true,
    // Para el demo local las tablas se crean solas. En producción con
    // PostgreSQL conviene pasar a migraciones y synchronize: false.
    synchronize: true,
    logging: false,
  };

  if (config.get<string>('DB_TYPE') === 'postgres') {
    return {
      ...common,
      type: 'postgres',
      host: config.get<string>('DB_HOST', 'localhost'),
      port: Number(config.get<string>('DB_PORT', '5432')),
      username: config.get<string>('DB_USERNAME', 'ciudades'),
      password: config.get<string>('DB_PASSWORD', 'ciudades'),
      database: config.get<string>('DB_NAME', 'ciudades'),
    };
  }

  return {
    ...common,
    type: 'sqljs',
    location: join(process.cwd(), config.get<string>('DB_PATH', './data/ciudades.sqlite')),
    autoSave: true,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseOptions,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    PostsModule,
    MediaModule,
    ActorsModule,
    EventsModule,
    ContactModule,
    StatsModule,
    SeedModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
