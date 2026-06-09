# 🚀 Vivero Invergil - Guía de Inicio

## Estado Actual
✅ **PostgreSQL** - Configurado en puerto 5432  
✅ **Base de datos** - `vivero_invergil` creada y poblada  
✅ **Backend Express** - Corriendo en puerto 3001  
✅ **Frontend Vite** - Corriendo en puerto 5173  
✅ **Migración** - Todos los datos importados de db.json  

---

## Credenciales de Acceso

### Usuario Administrador
```
Usuario: beatriz
Contraseña: admin123
Rol: administrador
```

### Usuario Empleado
```
Usuario: juan
Contraseña: emp123
Rol: empleado
```

---

## Cómo Ejecutar el Sistema

### Opción 1: Terminal Única (Recomendado para Pruebas)
```bash
npm run dev:full
```
Esta ejecuta automáticamente:
- Backend Express en http://localhost:3001
- Frontend Vite en http://localhost:5173

### Opción 2: Terminales Separadas

**Terminal 1 - Backend:**
```bash
npm run backend
```
- API REST en `http://localhost:3001`
- Logs de TypeORM habilitados
- Health check: `GET http://localhost:3001/api/health`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
- Interfaz en `http://localhost:5173`
- Hot reload habilitado
- Conecta automáticamente a `http://localhost:3001`

---

## Estructura de la Aplicación

### Frontend (puerto 5173)
- **Tecnología**: React + Vite
- **Rutas principales**:
  - `/login` - Login de usuarios
  - `/inicio` - Dashboard
  - `/nueva-venta` - Crear nueva venta con cálculo de cambio
  - `/ventas` - Listar y gestionar ventas
  - `/inventario` - Gestionar plantas
  - `/abonos` - Gestionar abonos
  - `/usuarios` - Gestionar usuarios
  - `/ganancias` - Reportes de ganancias

### Backend (puerto 3001)
- **Tecnología**: Express + TypeORM + PostgreSQL
- **Endpoints principales**:
  - `GET /api/health` - Verificar estado
  - `POST /api/usuarios/login` - Autenticación
  - `GET /api/plantas` - Listar plantas
  - `POST /api/ventas` - Crear venta
  - `POST /api/pagos-venta` - Registrar pago con cambio
  - `GET /api/descargar/ticket` - Descargar ticket (PDF)
  - `GET /api/descargar/factura` - Descargar factura (PDF)

---

## Funcionalidades Principales

### ✅ Cálculo de Cambio
- **Nueva Venta**: Al pagar en efectivo, calcula automáticamente el cambio
- **Ventas Existentes**: Permite registrar pagos con cálculo de cambio para saldos pendientes
- **Validación**: Rechaza pagos menores al monto adeudado

### ✅ Base de Datos PostgreSQL
- 6 tablas principales: usuarios, plantas, ventas, detalles_venta, abonos, pagos_venta
- Relaciones con cascade delete
- Sincronización automática (TypeORM synchronize: true)

### ✅ Autenticación
- Login con usuario y contraseña
- Token guardado en localStorage
- Roles: administrador y empleado

### ✅ Reportes
- Ganancias por período
- Descargas en PDF (ticket y factura)
- Envío de correos

---

## Base de Datos - PostgreSQL

### Credentials
```
Host: localhost
Puerto: 5432
Usuario: postgres
Base de datos: vivero_invergil
Contraseña: (sin contraseña - método trust)
```

### Tablas
1. **usuarios** - empleados del vivero
2. **plantas** - inventario
3. **ventas** - registro de ventas
4. **detalles_venta** - líneas de cada venta
5. **abonos** - abonos (fertilizantes)
6. **pagos_venta** - pagos registrados con campo `cambio`

### Ver Datos en PostgreSQL
```bash
# Conectar a la BD
psql -U postgres -d vivero_invergil

# Consultas útiles
SELECT * FROM usuarios;
SELECT * FROM plantas;
SELECT * FROM ventas;
SELECT * FROM pagos_venta;
```

---

## Variables de Entorno (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=
DB_NAME=vivero_invergil
NODE_ENV=development
API_PORT=3001
PDF_PORT=3002
VITE_API_URL=http://localhost:3001
```

---

## Solución de Problemas

### El backend no conecta a PostgreSQL
1. Verifica que PostgreSQL esté corriendo: 
   ```bash
   Get-Service postgresql-x64-18
   ```
2. Verifica que la BD exista:
   ```bash
   psql -U postgres -l
   ```

### El frontend no ve el backend
1. Abre la consola del navegador (F12)
2. Verifica que las requests vayan a `http://localhost:3001`
3. Asegúrate que el backend esté corriendo en otra terminal

### Error de permisos en carpetas de PDF
Las carpetas se crean automáticamente en:
- `C:\Users\{usuario}\Tickets`
- `C:\Users\{usuario}\Facturas`
- `C:\Users\{usuario}\Correos`

---

## Scripts Disponibles

```bash
npm run dev          # Solo frontend
npm run backend      # Solo backend
npm run dev:full     # Backend + frontend
npm run backend:build # Compilar TypeScript
npm run migrate-data # Ejecutar migración (solo primera vez)
```

---

## ¿Qué Cambió?

### Migremos de db.json a PostgreSQL
- ✅ Se eliminó la dependencia de db.json
- ✅ Se usa TypeORM para las operaciones de BD
- ✅ Las relaciones entre tablas ahora son enforce por constraints
- ✅ Los datos se sincronizan automáticamente

### Frontend
- ✅ Nueva Venta ahora calcula y muestra el cambio
- ✅ Registro de pagos permite cambio para pagos parciales
- ✅ Todos los servicios usan el API en puerto 3001

### Backend
- ✅ Express + TypeORM configurado
- ✅ 6 routers CRUD completos
- ✅ Endpoints de PDF preservados
- ✅ Logging de queries habilitado

---

**¡Sistema lista para usar!** 🎉
