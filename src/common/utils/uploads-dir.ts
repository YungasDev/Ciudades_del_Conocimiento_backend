import { join, resolve } from 'node:path';

/**
 * Carpeta de uploads. En local es ./uploads; en Render puede apuntar a un
 * disco persistente con UPLOAD_DIR (por ejemplo /var/data/uploads).
 */
export function uploadsDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return configured ? resolve(configured) : join(process.cwd(), 'uploads');
}
