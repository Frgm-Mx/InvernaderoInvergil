import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Visibility,
  PictureAsPdf,
  Email,
  Payment,
  Receipt,
} from "@mui/icons-material";
import VentaService from "../services/VentaService";
import DetalleVentaService from "../services/DetalleVentaService";
import PlantaService from "../services/PlantaService";
import PagoVentaService from "../services/PagoVentaService";
import { useAuth } from "../auth/AuthContext";
import {
  descargarTicket,
  descargarFactura,
  enviarPorCorreo,
} from "../utils/pdfGenerator";

export default function Ventas() {
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [plantas, setPlantas] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [todasLasPlantas, setTodasLasPlantas] = useState([]);


  // Detalle dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detalles, setDetalles] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [ventaSel, setVentaSel] = useState(null);

  // Pago adicional dialog
  const [pagoOpen, setPagoOpen] = useState(false);
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoForma, setPagoForma] = useState("efectivo");
  const [pagoNota, setPagoNota] = useState("");
  const [pagoError, setPagoError] = useState("");
  const [pagoSaving, setPagoSaving] = useState(false);

  const load = async () => {
    const [v, p] = await Promise.all([
      VentaService.getAll(),
      PlantaService.getAll(),
    ]);
    setVentas(v);
    setPlantas(p);
  };

useEffect(() => {
  const loadAll = async () => {
    const [v, p] = await Promise.all([
      VentaService.getAll(),
      PlantaService.getAllIncludingInactive(), // Nuevo método
    ]);
    setVentas(v);
    setTodasLasPlantas(p);
  };
  loadAll().catch(() => {});
}, []);

  const filtered =
    filtro === "todas"
      ? ventas
      : filtro === "mayoreo" || filtro === "menudeo"
        ? ventas.filter((v) => v.tipo_venta === filtro)
        : filtro === "con_anticipo" || filtro === "pagada"
          ? ventas.filter((v) => v.estado === filtro)
          : ventas.filter((v) => v.forma_pago === filtro);

const verDetalle = async (venta) => {
  // Guardar el ID de la venta que queremos ver
  const ventaId = venta.id;
  
  // Limpiar completamente los estados
  setDetalles([]);
  setPagos([]);
  setVentaSel(null);
  setCargandoDetalle(true);
  
  // Abrir el diálogo SOLO después de limpiar
  setDetailOpen(true);
  
  try {
    // Cargar datos en paralelo
    const [d, p] = await Promise.all([
      DetalleVentaService.getByVenta(ventaId),
      PagoVentaService.getByVenta(ventaId),
    ]);
    
    // Verificar que todavía sea la misma venta (por si el usuario abrió otra)
    if (ventaSel?.id === ventaId || !ventaSel) {
      setDetalles(d || []);
      setPagos(p || []);
      setVentaSel(venta);
    }
  } catch (error) {
    console.error('Error cargando detalles:', error);
    setDetalles([]);
    setPagos([]);
  } finally {
    setCargandoDetalle(false);
  }
};

const getNombrePlanta = (planta) => {
  // Si planta es un objeto con nombre
  if (planta && typeof planta === 'object') {
    if (planta.nombre) return planta.nombre;
    if (planta.id) {
      const encontrada = plantas.find(p => p.id === planta.id);
      return encontrada?.nombre || `Planta #${planta.id}`;
    }
  }
  // Si es un número (ID)
  if (typeof planta === 'number') {
    const encontrada = plantas.find(p => p.id === planta);
    return encontrada?.nombre || `Planta #${planta}`;
  }
  return `Planta desconocida`;
};

  const formatFecha = (f) => {
    const d = new Date(f);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDetallesConNombre = () =>
    detalles.map((d) => ({
      ...d,
      nombre_planta: getNombrePlanta(d.id_planta),
    }));

  const handleDescargarTicket = () => {
    if (ventaSel)
      descargarTicket(ventaSel, getDetallesConNombre(), pagos, user?.nombre);
  };

  const handleDescargarFactura = () => {
    if (ventaSel)
      descargarFactura(ventaSel, getDetallesConNombre(), pagos, user?.nombre);
  };

  const handleEnviarCorreo = () => {
    if (ventaSel)
      enviarPorCorreo(
        ventaSel,
        getDetallesConNombre(),
        pagos,
        user?.nombre,
        ventaSel.cliente_email,
      );
  };

  // Registrar pago adicional (para ventas con anticipo)
  const abrirPago = () => {
    setPagoMonto("");
    setPagoForma("efectivo");
    setPagoNota("");
    setPagoError("");
    setPagoOpen(true);
  };

  const registrarPago = async () => {
    const montoIngresado = Number(pagoMonto);
    const saldoActual = Number(ventaSel.saldo_pendiente);

    if (!pagoMonto || montoIngresado <= 0) {
      setPagoError("El monto debe ser mayor a $0");
      return;
    }
    if (montoIngresado < saldoActual) {
      setPagoError(
        `El monto debe ser al menos $${saldoActual.toFixed(2)} para liquidar o abonar`,
      );
      return;
    }

    // El cambio solo aplica si es efectivo
    const cambio =
      pagoForma === "efectivo" && montoIngresado > saldoActual
        ? montoIngresado - saldoActual
        : 0;

    // Si es efectivo, a la caja solo entran los bytes del saldo neto.
    // Si es transferencia, registramos el valor real transferido.
    const montoRealARegistrar =
      pagoForma === "efectivo" ? saldoActual : montoIngresado;

    setPagoSaving(true);
    try {
      const notaPago =
        pagoNota ||
        (cambio > 0
          ? `Pago final — liquidación · Cambio: $${cambio.toFixed(2)}`
          : "Pago final — liquidación");

      // 1. Crear el registro del Pago
      await PagoVentaService.create({
        id_venta: ventaSel.id,
        fecha: new Date().toISOString(),
        monto: montoRealARegistrar,
        tipo: "pago_final",
        forma_pago: pagoForma,
        nota: notaPago,
        cambio: cambio,
      });

      // 2. Calcular los nuevos impactos financieros de la venta
      const nuevoMontoPagado =
        Number(ventaSel.monto_pagado) + montoRealARegistrar;
      const nuevoSaldo = Math.max(0, saldoActual - montoRealARegistrar);

      const ventaActualizadaPayload = {
        ...ventaSel,
        monto_pagado: nuevoMontoPagado,
        saldo_pendiente: nuevoSaldo,
        estado: nuevoSaldo <= 0 ? "pagada" : "con_anticipo",
      };

      // 3. Persistir en el servidor
      await VentaService.update(ventaSel.id, ventaActualizadaPayload);

      // 4. Sincronizar estados locales de forma segura
      setPagoOpen(false);
      await load(); // Recarga la lista maestra del fondo

      // Actualizar la vista del detalle actual con el payload verificado
      setVentaSel(ventaActualizadaPayload);

      const historialPagosActualizado = await PagoVentaService.getByVenta(
        ventaSel.id,
      );
      setPagos(historialPagosActualizado);
    } catch (err) {
      console.error(err);
      setPagoError(
        "Error al procesar el pago en el servidor. Verifique la conexión.",
      );
    } finally {
      setPagoSaving(false);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4">Ventas</Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} ventas · $
            {filtered
              .reduce((s, v) => s + v.total, 0)
              .toLocaleString("es-MX", { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <TextField
          select
          label="Filtrar"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="todas">Todas</MenuItem>
          <MenuItem value="mayoreo">Mayoreo</MenuItem>
          <MenuItem value="menudeo">Menudeo</MenuItem>
          <MenuItem value="efectivo">Efectivo</MenuItem>
          <MenuItem value="transferencia">Transferencia</MenuItem>
          <MenuItem value="con_anticipo">Con anticipo pendiente</MenuItem>
          <MenuItem value="pagada">Pagadas</MenuItem>
        </TextField>
      </Box>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{ "& th": { fontWeight: 700, bgcolor: "grey.50" } }}
              >
                <TableCell>#</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Pago</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Nota Rem.</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>{v.id}</TableCell>
                  <TableCell>{formatFecha(v.fecha)}</TableCell>
                  <TableCell>{v.cliente_nombre || "Público general"}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    $
                    {Number(v.total).toLocaleString("es-MX", {
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={v.forma_pago}
                      size="small"
                      color={v.forma_pago === "efectivo" ? "success" : "info"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        v.estado === "pagada"
                          ? "Pagada"
                          : `Anticipo (debe $${Number(v.saldo_pendiente || 0).toFixed(0)})`
                      }
                      size="small"
                      color={v.estado === "pagada" ? "success" : "warning"}
                    />
                  </TableCell>
                  <TableCell>{v.nota_remision || "—"}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalle">
                      <IconButton size="small" onClick={() => verDetalle(v)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    No hay ventas registradas
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* DIALOG DETALLE */}
      {/* DIALOG DETALLE */}
<Dialog
  open={detailOpen}
  onClose={() => setDetailOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="h6">
        {cargandoDetalle ? "Cargando..." : `Venta #${ventaSel?.id || ''}`}
      </Typography>
      {!cargandoDetalle && ventaSel && (
        <Chip
          label={ventaSel.estado === "pagada" ? "PAGADA" : "CON ANTICIPO"}
          color={ventaSel.estado === "pagada" ? "success" : "warning"}
          size="small"
        />
      )}
    </Box>
  </DialogTitle>
  <DialogContent>
    {cargandoDetalle ? (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography>Cargando detalles de la venta...</Typography>
      </Box>
    ) : (
      <>
        {ventaSel && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Fecha: {formatFecha(ventaSel.fecha)}
            </Typography>
            <Typography variant="body2">
              Cliente: {ventaSel.cliente_nombre || "Público general"}
            </Typography>
            <Typography variant="body2">
              Pago: {ventaSel.forma_pago} · Tipo: {ventaSel.tipo_venta}
            </Typography>
            {ventaSel.nota_remision && (
              <Typography variant="body2">
                Nota: {ventaSel.nota_remision}
              </Typography>
            )}
            {ventaSel.observaciones && (
              <Typography variant="body2">
                Obs: {ventaSel.observaciones}
              </Typography>
            )}
          </Box>
        )}
        <Divider />

        {/* Productos */}
        <List dense>
          {detalles.map((d) => (
            <ListItem key={d.id}>
              <ListItemText
                primary={getNombrePlanta(d.id_planta)}
                secondary={`${d.cantidad} × $${Number(d.precio_unitario).toFixed(2)}`}
              />
              <Typography fontWeight={600}>
                ${Number(d.subtotal).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
          {detalles.length === 0 && !cargandoDetalle && (
            <ListItem>
              <ListItemText 
                primary="No hay productos en esta venta"
                secondary="Puede que los detalles no se hayan cargado correctamente"
              />
            </ListItem>
          )}
        </List>
        <Divider />

        {/* Totales */}
        <Box sx={{ mt: 1, mb: 1 }}>
          <Typography variant="h6" textAlign="right">
            Total: ${Number(ventaSel?.total || 0).toFixed(2)}
          </Typography>
          {ventaSel && Number(ventaSel.saldo_pendiente || 0) > 0 && (
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="body2">
                Pagado: ${Number(ventaSel.monto_pagado).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="error" fontWeight={700}>
                Saldo pendiente: $
                {Number(ventaSel.saldo_pendiente).toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Historial de pagos */}
        {pagos.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Historial de pagos
            </Typography>
            <List dense>
              {pagos.map((p) => (
                <ListItem
                  key={p.id}
                  sx={{ bgcolor: "grey.50", borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemText
                    primary={`${p.tipo === "anticipo" ? "Anticipo" : p.tipo === "pago_final" ? "Pago final" : p.tipo === "abono" ? "Abono" : "Pago"} — ${p.forma_pago}`}
                    secondary={`${formatFecha(p.fecha)}${p.nota ? ` · ${p.nota}` : ""}`}
                  />
                  <Typography fontWeight={600} color="success.main">
                    ${Number(p.monto).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Botones de acción */}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Receipt />}
            onClick={handleDescargarTicket}
            disabled={!ventaSel}
          >
            Ticket
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handleDescargarFactura}
            color="success"
            disabled={!ventaSel}
          >
            Factura
          </Button>
          {ventaSel?.cliente_email && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Email />}
              onClick={handleEnviarCorreo}
              color="info"
              disabled={!ventaSel}
            >
              Enviar correo
            </Button>
          )}
          {ventaSel && Number(ventaSel.saldo_pendiente || 0) > 0 && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Payment />}
              onClick={abrirPago}
              color="warning"
            >
              Registrar pago
            </Button>
          )}
        </Box>
      </>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDetailOpen(false)}>Cerrar</Button>
  </DialogActions>
</Dialog>

      {/* DIALOG REGISTRAR PAGO ADICIONAL */}
      <Dialog
        open={pagoOpen}
        onClose={() => setPagoOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Registrar Pago</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Saldo pendiente:{" "}
            <strong>
              ${Number(ventaSel?.saldo_pendiente || 0).toFixed(2)}
            </strong>
          </Typography>

          {pagoError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {pagoError}
            </Alert>
          )}

          <TextField
            label="Monto"
            type="number"
            value={pagoMonto}
            fullWidth
            sx={{ mb: 2 }}
            onChange={(e) => {
              setPagoMonto(e.target.value);
              setPagoError("");
            }}
            inputProps={{ min: 1, step: 0.5 }}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, color: "text.secondary" }}>
                  $
                </Typography>
              ),
            }}
          />

          {pagoForma === "efectivo" &&
            pagoMonto &&
            Number(pagoMonto) > Number(ventaSel?.saldo_pendiente || 0) && (
              <Typography
                variant="body2"
                color="success.main"
                fontWeight={600}
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: "success.main",
                  color: "success.contrastText", // Asegura legibilidad total
                  borderRadius: 1,
                }}
              >
                Cambio a entregar: $
                {(
                  Number(pagoMonto) - Number(ventaSel?.saldo_pendiente || 0)
                ).toFixed(2)}
              </Typography>
            )}

          <TextField
            select
            label="Forma de pago"
            value={pagoForma}
            fullWidth
            sx={{ mb: 2 }}
            onChange={(e) => setPagoForma(e.target.value)}
          >
            <MenuItem value="efectivo">Efectivo</MenuItem>
            <MenuItem value="transferencia">Transferencia</MenuItem>
          </TextField>
          <TextField
            label="Nota (opcional)"
            value={pagoNota}
            fullWidth
            onChange={(e) => setPagoNota(e.target.value)}
            placeholder="Ej: Segundo abono"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPagoOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={registrarPago}
            disabled={pagoSaving}
          >
            {pagoSaving ? "Guardando..." : "Registrar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
