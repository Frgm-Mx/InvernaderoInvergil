# 📊 Migración a PostgreSQL - Resumen de cambios

## ✅ Estructura de carpetas nueva

```
vivero-invergil/
├── src/                          # Frontend React (sin cambios)
│   ├── pages/
│   ├── services/
│   ├── components/
│   └── ...
├── src-backend/                  # ✨ NUEVO: Backend con Express + TypeORM
│   ├── entities/                 # Entidades de base de datos
│   │   ├── Usuario.ts
│   │   ├── Planta.ts
│   │   ├── Venta.ts
│   │   ├── DetalleVenta.ts
│   │   ├── Abono.ts
│   │   └── PagoVenta.ts
│   ├── routes/                   # Rutas de la API
│   │   ├── index.ts
│   │   ├── usuarios.ts
│   │   ├── plantas.ts
│   │   ├── ventas.ts
│   │   ├── detallesVenta.ts
│   │   ├── abonos.ts
│   │   └── pagosVenta.ts
│   ├── app.ts                    # Servidor Express principal
│   ├── database.ts               # Configuración de TypeORM
│   └── migrate.ts                # Script de migración de datos
├── .env                          # Variables de entorno (PostgreSQL)
├── .env.example                  # Ejemplo de .env
├── POSTGRESQL_SETUP.md           # ✨ NUEVO: Guía de configuración
├── server.js                     # Servidor de PDFs (mantiene su funcionalidad)
├── db.json                       # Backup de datos (puede eliminarse después)
└── package.json                  # Scripts actualizados
```

---

## 🔄 Cambios en package.json

### Nuevas dependencias instaladas:
- `typeorm` - ORM para PostgreSQL
- `pg` - Driver de PostgreSQL
- `reflect-metadata` - Requerido por TypeORM
- `tsx` - Ejecutor de TypeScript en desarrollo
- `typescript` - Compilador de TypeScript
- `@types/node`, `@types/express` - Tipos para Node y Express
- `dotenv` - Gestión de variables de entorno

### Nuevos scripts:
```json
{
  "backend": "tsx watch src-backend/app.ts",        // Ejecutar backend en desarrollo
  "backend:build": "tsc",                           // Compilar TypeScript
  "migrate": "typeorm migration:run -d src-backend/database.ts",
  "migrate:generate": "typeorm migration:generate -d src-backend/database.ts",
  "migrate-data": "tsx src-backend/migrate.ts",     // Migrar datos de db.json
  "dev:full": "concurrently \"npm run dev\" \"npm run backend\""
}
```

---

## 🗄️ Entidades TypeORM Creadas

### 1. **Usuario**
- id (PK)
- nombre
- usuario (UNIQUE)
- password
- rol
- Relación: ← N Ventas

### 2. **Planta**
- id (PK)
- nombre
- tipo
- cantidad
- precio
- costo_produccion
- costo_compra
- cultivada_vivero
- descripcion
- Relación: ← N DetalleVenta

### 3. **Venta**
- id (PK)
- fecha
- total
- forma_pago
- tipo_venta
- id_usuario (FK)
- nota_remision
- observaciones
- anticipo
- monto_pagado
- saldo_pendiente
- estado
- cliente_nombre
- cliente_telefono
- cliente_email
- Relaciones: → Usuario, ← N DetalleVenta, ← N PagoVenta

### 4. **DetalleVenta**
- id (PK)
- id_venta (FK)
- id_planta (FK)
- cantidad
- precio_unitario
- subtotal
- Relaciones: → Venta, → Planta

### 5. **Abono**
- id (PK)
- nombre
- uso
- cantidad

### 6. **PagoVenta**
- id (PK)
- id_venta (FK)
- fecha
- monto
- tipo
- forma_pago
- nota
- cambio (nuevo campo para registro de cambio)
- Relación: → Venta

---

## 📡 Rutas de API disponibles

Todas las rutas usan `/api/` como prefijo base.

### Estructura de respuestas
**Éxito:**
```json
[
  { "id": 1, "nombre": "...", ... }
]
```

**Error:**
```json
{ "error": "Descripción del error" }
```

### Endpoints principales

| Recurso | Método | Ruta | Descripción |
|---------|--------|------|------------|
| Usuarios | GET | `/usuarios` | Obtener todos |
| Usuarios | GET | `/usuarios/:id` | Obtener por ID |
| Usuarios | POST | `/usuarios` | Crear nuevo |
| Usuarios | PUT | `/usuarios/:id` | Actualizar |
| Usuarios | DELETE | `/usuarios/:id` | Eliminar |
| | | | |
| Plantas | GET | `/plantas` | Obtener todas |
| Plantas | PATCH | `/plantas/:id/stock` | Actualizar stock |
| | | | |
| Ventas | GET | `/ventas` | Obtener todas (con relaciones) |
| Ventas | POST | `/ventas` | Crear nueva venta |
| | | | |
| Detalles | GET | `/detalles-venta/venta/:id_venta` | Detalles de una venta |
| Detalles | POST | `/detalles-venta/bulk` | Crear múltiples |
| | | | |
| Pagos | GET | `/pagos-venta/venta/:id_venta` | Pagos de una venta |
| Pagos | POST | `/pagos-venta` | Registrar nuevo pago |

---

## 🚀 Guía de uso rápido

### 1. Instalar y configurar PostgreSQL
Ver archivo `POSTGRESQL_SETUP.md`

### 2. Configurar .env
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=vivero_invergil
VITE_API_URL=http://localhost:3001
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Migrar datos
```bash
npm run migrate-data
```

### 5. Ejecutar en desarrollo
```bash
npm run dev:full
```

Esto abre:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

---

## 🔌 Compatibilidad del Frontend

El frontend **NO REQUIERE CAMBIOS** porque:

✅ Los servicios ya usan `import.meta.env.VITE_API_URL`
✅ Las rutas de API son compatibles (json-server emula el mismo estilo)
✅ El .env ya configura la URL correcta

---

## 🔐 Variables de Entorno

Archivo `.env`:
```env
# PostgreSQL
DB_HOST=localhost           # Host de la BD
DB_PORT=5432               # Puerto (default postgres)
DB_USER=postgres           # Usuario de la BD
DB_PASSWORD=postgres       # Contraseña
DB_NAME=vivero_invergil    # Nombre de la BD

# Node.js
NODE_ENV=development       # development o production
API_PORT=3001              # Puerto del backend
PDF_PORT=3002              # Puerto de PDFs (si se usa)

# Frontend
VITE_API_URL=http://localhost:3001  # URL de la API
```

---

## 📝 Notas importantes

1. **Sincronización automática**: En desarrollo, TypeORM crea/actualiza tablas automáticamente.
2. **Cambios de código**: Todos en `src-backend/` (nuevo)
3. **Frontend intacto**: Ningún cambio requerido en `src/`
4. **db.json**: Puedes eliminarlo después de verificar que todo funciona
5. **Puerto**: Si 3001 está ocupado, cambiar en `.env` y `VITE_API_URL`

---

## ✨ Mejoras con PostgreSQL

- ✅ Persistencia real de datos
- ✅ Mejor rendimiento para grandes volúmenes
- ✅ Seguridad mejorada
- ✅ Transacciones ACID
- ✅ Relaciones fuerte (Foreign Keys)
- ✅ Escalabilidad
- ✅ Mejor para producción

