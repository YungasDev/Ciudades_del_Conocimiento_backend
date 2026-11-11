import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

/**
 * Fuente de datos que utiliza la CLI de TypeORM para generar y ejecutar
 * migraciones. La aplicación NestJS configura su propia conexión en
 * `app.module.ts`, pero reutiliza las mismas variables de entorno.
 */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false,
});
