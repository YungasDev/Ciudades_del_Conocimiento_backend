import 'dotenv/config';

/**
 * Tipo de columna para fechas compatible con los dos motores del proyecto:
 * - PostgreSQL/Aiven: timestamptz
 * - SQLite/sql.js local: datetime
 *
 * Se decide al cargar las entidades, cuando ya se leyó el .env.
 */
export const DATE_COLUMN_TYPE: any =
  process.env.DB_TYPE === 'postgres' ? 'timestamptz' : 'datetime';
