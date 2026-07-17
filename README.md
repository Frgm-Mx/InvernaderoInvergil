# Vivero Invergil — Sistema de Control de Inventario y Ventas

**Proyecto Integrador · 6° Semestre · Desarrollo de Aplicaciones Web (Grupo 603)**  
Tecnológico Superior de San Felipe del Progreso (TESSFP)

---

## 📋 Descripción

Aplicación web para la gestión integral del Vivero "Invergil", propiedad de Beatriz López Cárdenas, ubicado en San Felipe del Progreso, Estado de México. El sistema digitaliza el control de inventario, registro de ventas (menudeo y mayoreo), generación de comprobantes PDF, seguimiento de anticipos y cálculo automático de ganancias. Funciona de forma local en una red LAN sin depender de conexión a internet.

---

## 🎯 Características Principales

- **Autenticación segura** con validación de campos y protección contra fuerza bruta (5 intentos, bloqueo 30s)
- **Control de inventario** completo con CRUD de plantas, diferenciación entre cultivadas y compradas
- **Registro de ventas** con clasificación automática (mayoreo ≥1000 plantas / menudeo)
- **Sistema de anticipos** con seguimiento de pagos parciales y saldo pendiente
- **Generación de comprobantes** en PDF (ticket mini y factura carta) descargables o enviables por correo
- **Cálculo de ganancias** automático diferenciando costos de producción vs compra
- **Gestión de usuarios** con roles diferenciados (administradora / empleado)
- **Interfaz responsiva** compatible con dispositivos móviles y de escritorio
- **Validaciones en tiempo real** a nivel de campo en todos los módulos

---

## 🛠 Stack Tecnológico

### Frontend
- **React 18** — Biblioteca de UI
- **Vite 5** — Bundler y servidor de desarrollo
- **Material UI 6** — Componentes visuales profesionales
- **Axios** — Cliente HTTP para comunicación con backend
- **React Router 6** — Navegación entre pantallas
- **jsPDF + jsPDF-AutoTable** — Generación de comprobantes PDF

### Backend
- **JSON Server** (desarrollo) / **PHP o Node.js** (producción)
- **API REST** con endpoints CRUD

### Base de Datos
- **MySQL 8** o **PostgreSQL** — Base de datos relacional
- 7 tablas: `usuarios`, `plantas`, `ventas`, `detalles_venta`, `pagos_venta`, `abonos`, `notas_remision`
- Triggers automáticos para descuento de stock
- Procedimientos almacenados para registro de pagos
- Vistas para reportes de ganancias y ventas pendientes

---

## 📦 Instalación

### Requisitos Previos
- **Node.js 16+** con npm
- **Git** para clonar el repositorio
- **PostgreSQL** o **MySQL** instalado localmente (opcional si usas JSON Server)

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd vivero-invergil
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Iniciar la base de datos

**Opción A: JSON Server (desarrollo rápido, sin instalación de BD)**

```bash
npm run server
```

En otra terminal, abre `/db.json` y verifica que tenga datos. Si está vacío, ejecuta:

```bash
node populate-db.js
```

**Opción B: PostgreSQL (producción)**

Crea la base de datos:

```bash
psql -U postgres
CREATE DATABASE vivero_invergil;
\c vivero_invergil
```

Importa el esquema SQL:

```bash
psql -U postgres -d vivero_invergil -f database/vivero_invergil.sql
```

### Paso 4: Iniciar la aplicación

```bash
npm run dev
```

La aplicación abrirá en `http://localhost:5173`

---

## 🚀 Acceso desde Red Local

Para que otros dispositivos en tu red accedan:

### 1. Obtener tu IP local

**Windows:**
```powershell
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

### 2. Acceder desde otra máquina

```
http://192.168.1.100:5173
```

(Reemplaza `192.168.1.100` con tu IP local)

### 3. Configurar backend en red

Edita `src/services/api.js`:

```javascript
const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : `http://${window.location.hostname}:3001`

const API = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})
```

---

## 🔐 Credenciales de Prueba

| Usuario  | Contraseña | Rol             |
|----------|------------|-----------------|
| beatriz  | admin123   | Administradora  |
| juan     | emp123     | Empleado        |

---

## 📱 Módulos de la Aplicación

### 🔓 Login
- Validación de usuario y contraseña
- Protección contra fuerza bruta
- Mensajes de error específicos por campo
- Bloqueo automático tras 5 intentos fallidos

### 📦 Inventario
- Crear, editar y eliminar plantas
- Diferenciar plantas cultivadas vs compradas
- Indicadores visuales de stock (bajo, medio, alto)
- Búsqueda y filtrado por tipo

### 🛒 Nueva Venta
- Seleccionar múltiples productos
- Validación de stock en tiempo real
- Datos del cliente (opcional)
- Sistema de anticipo con cálculo de saldo pendiente
- Generación automática de ticket/factura post-venta

### 📊 Historial de Ventas
- Listado con filtros (mayoreo/menudeo, forma de pago, estado)
- Detalle completo de cada venta
- Historial de pagos registrados
- Registrar pagos adicionales (para ventas con anticipo)
- Descargar o enviar comprobantes por correo

### 💰 Ganancias
- Resumen: ingresos, costos, ganancia neta
- Desglose por planta con margen de ganancia
- Diferenciación de costos (producción vs compra)
- Visualización de plantas más rentables

### ✅ Abonos/Fertilizantes
- Gestionar abonos para floración
- CRUD con validaciones

### 👥 Usuarios
- Crear, editar y eliminar usuarios
- Asignar roles (administradora/empleado)
- Cambiar contraseñas
- Validación de campos

---

## 📄 Generación de Comprobantes

### Ticket (Formato Mini 80mm)
- Recibo de caja estilo terminal de punto de venta
- Encabezado del vivero
- Detalle de productos
- Totales con desglose de anticipo (si aplica)
- Ideal para impresoras térmicas de 80mm

### Factura (Tamaño Carta)
- Formato formal profesional
- Encabezado verde con logo del vivero
- Datos del cliente
- Tabla de productos con cantidades y precios
- Historial de pagos
- Observaciones
- Pie de página con datos de contacto

**Opciones de descarga:**
- Descargar como PDF a la máquina
- Abrir cliente de correo con PDF adjunto automático
- Asunto y cuerpo del correo prellenados

---

## 🎯 Funcionalidades Detalladas

### Sistema de Anticipos
El cliente puede pagar parcialmente al momento de la compra:
1. En Nueva Venta, activa "El cliente paga con anticipo"
2. Ingresa el monto del anticipo
3. El sistema calcula automáticamente el saldo pendiente
4. La venta se registra con estado "con_anticipo"
5. En Historial de Ventas, puedes registrar pagos adicionales
6. Cuando se liquida, la venta cambia automáticamente a "pagada"

### Clasificación Mayoreo/Menudeo
- Automática según cantidad total de plantas
- **Mayoreo:** ≥ 1,000 plantas
- **Menudeo:** < 1,000 plantas
- Clasificación visible en el chip de estado

### Cálculo de Ganancias
Fórmula: `(Precio de Venta - Costo Relevante) × Cantidad Vendida`

- Para plantas cultivadas: usa `costo_produccion`
- Para plantas compradas: usa `costo_compra`
- Margenes calculados automáticamente por planta

---

## 📂 Estructura del Proyecto

```
vivero-invergil/
├── public/                    # Recursos públicos
├── src/
│   ├── main.jsx              # Punto de entrada
│   ├── App.jsx               # Rutas principales
│   ├── index.html            # HTML base
│   ├── theme/
│   │   └── theme.js          # Tema MUI (colores: verde vivero)
│   ├── auth/
│   │   └── AuthContext.jsx   # Context de autenticación global
│   ├── components/
│   │   ├── Layout.jsx        # Sidebar responsivo
│   │   └── ProtectedRoute.jsx # Guard de rutas autenticadas
│   ├── services/
│   │   ├── api.js            # Instancia Axios
│   │   ├── AuthService.js    # Autenticación
│   │   ├── PlantaService.js  # CRUD plantas
│   │   ├── VentaService.js   # CRUD ventas
│   │   ├── DetalleVentaService.js  # CRUD detalles
│   │   ├── AbonoService.js   # CRUD abonos
│   │   ├── UsuarioService.js # CRUD usuarios
│   │   └── PagoVentaService.js     # Historial de pagos
│   ├── utils/
│   │   └── pdfGenerator.js   # Funciones de generación de PDF
│   └── pages/
│       ├── Login.jsx         # Pantalla de login
│       ├── Inicio.jsx        # Dashboard
│       ├── Inventario.jsx    # Gestión de plantas
│       ├── NuevaVenta.jsx    # Registro de ventas
│       ├── Ventas.jsx        # Historial y detalles
│       ├── Ganancias.jsx     # Resumen financiero
│       ├── Abonos.jsx        # Gestión de fertilizantes
│       └── Usuarios.jsx      # Gestión de usuarios
├── database/
│   └── vivero_invergil.sql   # Esquema completo de BD
├── db.json                   # Base de datos JSON (desarrollo)
├── populate-db.js            # Script para poblar datos de prueba
├── vite.config.js            # Configuración de Vite
├── package.json              # Dependencias
├── .env.example              # Variables de entorno (ejemplo)
└── README.md                 # Este archivo
```

---

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=Vivero Invergil
```

Para red local:

```
VITE_API_URL=http://192.168.1.100:3001
```

---

## 📊 Base de Datos

### Tablas Principales

**usuarios** — Usuarios del sistema  
**plantas** — Catálogo de plantas del inventario  
**ventas** — Registro de transacciones  
**detalles_venta** — Líneas de cada venta  
**pagos_venta** — Historial de pagos/anticipos  
**abonos** — Fertilizantes y abonos  
**notas_remision** — Comprobantes de entrega  

### Triggers Automáticos

- **trg_validar_stock** — Valida stock antes de vender
- **trg_descontar_stock** — Descuenta stock automáticamente al vender
- **trg_calcular_subtotal** — Calcula subtotales

### Vistas Predefinidas

- **v_ventas_resumen** — Ventas con nombre de vendedor
- **v_ganancias_planta** — Ganancias por planta
- **v_ventas_pendientes** — Ventas con anticipo pendiente
- **v_stock_bajo** — Plantas con stock < 100

---

## 🧪 Pruebas

Para validar la aplicación, consulta el documento `Casos_de_Prueba_Vivero_Invergil.docx` que incluye 17 casos de prueba cubriendo:

- Funcionalidad general
- Validaciones de entrada
- Seguridad (fuerza bruta, sesiones)
- Integración de módulos

---

## ⚙️ Scripts Disponibles

```bash
npm run dev       # Inicia Vite en desarrollo
npm run build     # Construye para producción
npm run preview   # Vista previa de build
npm run server    # Inicia JSON Server
npm run dev:all   # Inicia Vite + JSON Server simultáneamente
```

---

## 🌐 Despliegue en Producción

Para un entorno de producción:

1. **Compilar la aplicación:**
   ```bash
   npm run build
   ```

2. **Configurar backend real** (PHP o Node.js + Express)

3. **Conectar a base de datos PostgreSQL/MySQL** en servidor

4. **Configurar variables de entorno** con URLs de producción

5. **Servir archivos estáticos** desde servidor (Apache, Nginx, etc.)

---

## 🐛 Solución de Problemas

### "Error: DetalleVentaService.getAll is not a function"
- Verifica que todos los servicios tengan el método `getAll`
- Reinicia `npm run server`

### Plantas no aparecen en Nueva Venta
- Ejecuta `node populate-db.js` para cargar datos de prueba
- Revisa que JSON Server esté corriendo en puerto 3001

### "No me deja entrar desde otra máquina"
- Verifica tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
- Abre puerto 5173 en firewall de Windows
- Confirma que ambas máquinas están en la misma red WiFi

### PDF no se descarga
- Verifica que jsPDF está instalado: `npm list jspdf`
- Intenta en otra navegador (Chrome, Firefox, Edge)

### Stock no se descuenta
- Revisa que detalles_venta se inserten correctamente
- Confirma que triggers de BD estén activos: `SHOW TRIGGERS;` (MySQL)

---

## 📝 Documentación

- **Documentacion_Vivero_Invergil.docx** — Documento completo del proyecto
- **Casos_de_Prueba_Vivero_Invergil.docx** — Matriz de casos de prueba
- **vivero_invergil.sql** — Esquema completo de base de datos

---
