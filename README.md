# Ciudades del Conocimiento — Backend

API del programa **Ciudades del Conocimiento** de la Municipalidad de Libertador General San Martín (Jujuy).

Construida con **NestJS 11 + TypeORM**. Para desarrollo local usa **SQLite embebido (sql.js)**; también soporta **PostgreSQL**.

## Requisitos

- Node.js 20 o superior.
- npm.
- PostgreSQL solo si se elige esa base (Docker Compose o servidor propio).

## Instalación

```bash
npm install
```

## Configuración

Copiar el archivo de ejemplo y ajustar los valores:

```bash
copy .env.example .env
```

Variables principales:

```env
PORT=3000
CORS_ORIGIN=http://localhost:4200,http://localhost:8080
JWT_SECRET=cambiar-por-un-secreto-largo-y-aleatorio
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@ciudades.local
ADMIN_PASSWORD=CambiarEstaClave123!
DB_TYPE=sqljs
DB_PATH=./data/ciudades.sqlite
```

Para PostgreSQL:

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ciudades
DB_PASSWORD=ciudades
DB_NAME=ciudades
```

## Desarrollo

```bash
npm run start:dev
```

API en <http://localhost:3000/api>.

## Producción local

```bash
npm run build
node dist/main.js
```

## Base de datos

- **Local:** `data/ciudades.sqlite` (se crea sola).
- **PostgreSQL:** configurar las variables `DB_*`.
- El seed crea el usuario administrador, las categorías, seis novedades de ejemplo, un evento y las instituciones iniciales.
- Para reiniciar el contenido local: detener la API y borrar `data/ciudades.sqlite`.

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado de la API y la base |
| POST | `/api/auth/login` | Login del panel |
| GET | `/api/posts` | Novedades publicadas |
| GET | `/api/posts/:slug` | Detalle de novedad |
| GET | `/api/categories` | Categorías |
| GET | `/api/actors` | Instituciones publicadas con consentimiento |
| GET | `/api/events` | Agenda |
| POST | `/api/contact` | Formulario de contacto |
| GET | `/api/admin/stats` | Métricas del panel |
| CRUD | `/api/admin/posts` | Novedades (requiere JWT) |
| CRUD | `/api/admin/actors` | Instituciones (requiere JWT) |
| CRUD | `/api/admin/categories` | Categorías (requiere JWT) |
| CRUD | `/api/admin/events` | Eventos (requiere JWT) |
| GET/PATCH | `/api/admin/contact` | Mensajes (requiere JWT) |

Los endpoints de administración esperan el token JWT en:

```
Authorization: Bearer <token>
```

## Subida de imágenes

- Los archivos se guardan en `uploads/`.
- Formatos permitidos: JPG, PNG, WebP y AVIF.
- Tamaño máximo: 5 MB.
- Se sirven en `/uploads/...`.

## Pruebas

```bash
npm test
```

## Seguridad

- No subir `.env` al repositorio.
- No subir `data/ciudades.sqlite` ni `uploads/`.
- Cambiar `ADMIN_PASSWORD` y `JWT_SECRET` antes de publicar.
- En producción, usar PostgreSQL, HTTPS y cookies seguras.

## Frontend

El frontend Angular está en:

<https://github.com/YungasDev/Ciudades_del_Conocimiento_frontend>

## Docker

El `Dockerfile` y el `docker-compose.yml` del proyecto general permiten levantar la API con PostgreSQL y Nginx.
