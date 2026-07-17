# Vivero Invergil — Sistema de Control de Inventario y Ventas

**Proyecto Integrador · 6° Semestre — Desarrollo de Aplicaciones Web (Grupo 603)**
Tecnológico Superior de San Felipe del Progreso

## Descripción

Aplicación web para el control de inventario, ventas y abonos del vivero "Invergil". Funciona de forma local (sin internet) en dispositivos móviles y de escritorio.

## Stack Tecnológico

- **Frontend:** React 18 + Vite 5 + MUI 6 + React Router 6 + Axios
- **Backend (mock):** JSON Server
- **PDF:** jsPDF + jsPDF-AutoTable

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar JSON Server (backend mock) en una terminal
npm run server
# → Corre en http://localhost:3001

# 3. En otra terminal, iniciar la app React
npm run dev
# → Corre en http://localhost:5173
```

## Credenciales de prueba

| Usuario  | Contraseña | Rol             |
|----------|------------|-----------------|
| beatriz  | admin123   | Administradora  |
| juan     | emp123     | Empleado        |

## Funcionalidades (RF-01 a RF-16)

### Login (RF-01)
- Validación de campos: obligatorios, longitud mínima, no espacios en usuario
- Protección contra fuerza bruta: máximo 5 intentos, bloqueo de 30 segundos con cuenta regresiva
- Mensajes de error claros por campo

### Inventario (RF-02, RF-03, RF-04, RF-12, RF-16)
- CRUD completo de plantas con validaciones por campo
- Control de origen: cultivada en vivero vs comprada a proveedor
- Costos de producción / compra separados
- Stock con indicadores de color (bajo, medio, alto)

### Nueva Venta (RF-05, RF-06, RF-07, RF-08, RF-15)
- Datos del cliente opcionales (nombre, teléfono, email)
- Detalle de productos con validaciones: stock, duplicados, enteros, precios
- Tipo automático: mayoreo (≥1000 plantas) / menudeo
- **Sistema de anticipos:** toggle para pagar parcial, con cálculo de saldo pendiente
- **Post-venta:** diálogo para descargar ticket (formato mini), factura (carta), o enviar por correo
- Descuento de stock automático al registrar

### Historial de Ventas (RF-09, RF-10, RF-13)
- Tabla con filtros: todas, mayoreo, menudeo, efectivo, transferencia, con anticipo, pagadas
- Columnas: cliente, estado (chip color), nota de remisión
- Detalle completo: productos, totales, desglose de anticipo, historial de pagos
- **Acciones:** descargar ticket PDF, descargar factura PDF, enviar por correo, registrar pago adicional
- Registro de pagos adicionales con validación de monto ≤ saldo pendiente

### Ganancias (RF-09)
- Resumen de ingresos, costos y ganancia neta
- Desglose por planta con margen de ganancia
- Gráfico visual de ganancia por producto

### Abonos (RF-11)
- CRUD de abonos para floración con validaciones por campo

### Usuarios (RF-14)
- CRUD de usuarios con validaciones: nombre, usuario, contraseña
- Roles: administradora / empleado

## Generación de PDF

El sistema genera dos tipos de comprobantes:

1. **Ticket (formato mini 80mm):** formato recibo de caja con encabezado del vivero, detalle de productos, totales y desglose de anticipos
2. **Factura (tamaño carta):** formato formal con encabezado verde, datos del cliente, tabla de productos, historial de pagos y observaciones

Ambos se pueden descargar como PDF o abrir el cliente de correo para enviarlos.

## Sistema de Anticipos

- El cliente puede pagar una parte del total al momento de la venta
- Se registra como "con anticipo" y el saldo pendiente se muestra en la tabla de ventas
- Desde el historial se pueden registrar pagos adicionales hasta liquidar
- Cada pago queda en el historial de pagos de la venta
- Cuando el saldo llega a $0, la venta cambia a estado "pagada"

## Estructura del proyecto

```
vivero-invergil/
├── db.json                  # Base de datos JSON Server
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx              # Rutas
│   ├── theme/theme.js       # Tema MUI (verde vivero)
│   ├── auth/AuthContext.jsx  # Contexto de autenticación
│   ├── components/
│   │   ├── Layout.jsx       # Sidebar responsive
│   │   └── ProtectedRoute.jsx
│   ├── services/
│   │   ├── api.js           # Instancia Axios
│   │   ├── AuthService.js
│   │   ├── PlantaService.js
│   │   ├── VentaService.js
│   │   ├── DetalleVentaService.js
│   │   ├── AbonoService.js
│   │   ├── UsuarioService.js
│   │   └── PagoVentaService.js
│   ├── utils/
│   │   └── pdfGenerator.js  # Generación de ticket y factura PDF
│   └── pages/
│       ├── Login.jsx
│       ├── Inicio.jsx
│       ├── Inventario.jsx
│       ├── NuevaVenta.jsx
│       ├── Ventas.jsx
│       ├── Ganancias.jsx
│       ├── Abonos.jsx
│       └── Usuarios.jsx
```
