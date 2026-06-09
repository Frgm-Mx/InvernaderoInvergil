# Migración a PostgreSQL - Vivero Invergil

## 📋 Guía de configuración

### 1️⃣ Instalar PostgreSQL

**En Windows:**
- Descargar de https://www.postgresql.org/download/windows/
- Instalar con la contraseña que desees para el usuario `postgres`
- Recordar el puerto (por defecto 5432)

**En macOS (con Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**En Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2️⃣ Crear la base de datos

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear la base de datos
CREATE DATABASE vivero_invergil;

-- Crear el usuario (opcional, para seguridad)
CREATE USER vivero_user WITH PASSWORD 'tu_contraseña';
ALTER ROLE vivero_user SET client_encoding TO 'utf8';
ALTER ROLE vivero_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vivero_user SET default_transaction_deferrable TO on;
ALTER ROLE vivero_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE vivero_invergil TO vivero_user;

-- Salir
\q
```

### 3️⃣ Configurar variables de entorno

Edita el archivo `.env` en la raíz del proyecto:

```env
# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=vivero_invergil

# Node
NODE_ENV=development
API_PORT=3001
PDF_PORT=3002

# API Base URL
VITE_API_URL=http://localhost:3001
```

### 4️⃣ Instalar dependencias

```bash
npm install
```

### 5️⃣ Migrar datos de db.json a PostgreSQL

```bash
npm run migrate-data
```

Esto ejecutará el script que:
- Lee el archivo `db.json`
- Crea las tablas automáticamente
- Migra todos los datos a PostgreSQL

### 6️⃣ Ejecutar la aplicación

**Modo desarrollo (Frontend + Backend):**
```bash
npm run dev:full
```

O por separado:

**Frontend:**
```bash
npm run dev
```

**Backend (en otra terminal):**
```bash
npm run backend
```

### 7️⃣ Verificar que funciona

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api/health
- Documentación de rutas: Ver más abajo

---

## 📡 Rutas de la API

### Usuarios
- `GET /api/usuarios` - Obtener todos
- `GET /api/usuarios/:id` - Obtener por ID
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/:id` - Actualizar
- `DELETE /api/usuarios/:id` - Eliminar

### Plantas
- `GET /api/plantas` - Obtener todas
- `GET /api/plantas/:id` - Obtener por ID
- `POST /api/plantas` - Crear
- `PUT /api/plantas/:id` - Actualizar
- `PATCH /api/plantas/:id/stock` - Actualizar stock
- `DELETE /api/plantas/:id` - Eliminar

### Ventas
- `GET /api/ventas` - Obtener todas
- `GET /api/ventas/:id` - Obtener por ID
- `POST /api/ventas` - Crear
- `PUT /api/ventas/:id` - Actualizar
- `DELETE /api/ventas/:id` - Eliminar

### Detalles de Venta
- `GET /api/detalles-venta` - Obtener todos
- `GET /api/detalles-venta/venta/:id_venta` - Por venta
- `POST /api/detalles-venta` - Crear
- `POST /api/detalles-venta/bulk` - Crear múltiples
- `PUT /api/detalles-venta/:id` - Actualizar
- `DELETE /api/detalles-venta/:id` - Eliminar

### Abonos
- `GET /api/abonos` - Obtener todos
- `GET /api/abonos/:id` - Obtener por ID
- `POST /api/abonos` - Crear
- `PUT /api/abonos/:id` - Actualizar
- `DELETE /api/abonos/:id` - Eliminar

### Pagos de Venta
- `GET /api/pagos-venta` - Obtener todos
- `GET /api/pagos-venta/venta/:id_venta` - Por venta
- `GET /api/pagos-venta/:id` - Obtener por ID
- `POST /api/pagos-venta` - Crear
- `PUT /api/pagos-venta/:id` - Actualizar
- `DELETE /api/pagos-venta/:id` - Eliminar

### PDF
- `POST /api/descargar/ticket` - Guardar ticket
- `POST /api/descargar/factura` - Guardar factura
- `POST /api/enviar/correo` - Guardar correo

---

## 🔧 Scripts útiles

```bash
# Crear TypeScript compilado
npm run backend:build

# Ver logs de TypeORM en desarrollo
npm run backend

# Ejecutar migraciones de base de datos
npm run migrate

# Generar migraciones nuevas
npm run migrate:generate

# Ejecutar frontend y backend juntos
npm run dev:full
```

---

## ⚠️ Notas importantes

1. **TypeORM sincronización**: En desarrollo (`NODE_ENV=development`), TypeORM crea/actualiza tablas automáticamente. En producción, desactívalo.

2. **Contraseña**: Cambia la contraseña de PostgreSQL por seguridad antes de producción.

3. **Puerto**: Si el puerto 3001 está ocupado, cambia `API_PORT` en `.env`.

4. **Base de datos antigua**: El archivo `db.json` se mantiene como backup. Puedes eliminarlo después de verificar que todo funciona correctamente.

---

## ✅ Checklist de migración

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos creada
- [ ] Variables `.env` configuradas
- [ ] Dependencias instaladas (`npm install`)
- [ ] Datos migrados (`npm run migrate-data`)
- [ ] Backend funciona (`npm run backend`)
- [ ] Frontend conecta a la API
- [ ] Todas las operaciones CRUD funcionan

---

## 🆘 Troubleshooting

**Error: "connect ECONNREFUSED"**
- PostgreSQL no está corriendo
- Solución: `sudo systemctl start postgresql` (Linux) o iniciar desde el GUI

**Error: "database does not exist"**
- La base de datos no fue creada
- Solución: Ejecutar el SQL de creación

**Error: "permission denied"**
- Usuario no tiene permisos
- Solución: Ejecutar los GRANT ALL PRIVILEGES

**TypeORM no sincroniza**
- Verifica que `synchronize: true` esté en `database.ts`
- Solución: Reiniciar el servidor backend

