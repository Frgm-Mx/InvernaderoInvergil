import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, TextField, MenuItem, Button, IconButton, Card, CardContent,
  Table, TableHead, TableRow, TableCell, TableBody, Divider, Alert, Switch,
  FormControlLabel, Collapse, Chip, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import Grid2 from "@mui/material/Grid2"; 
import { Delete, Add, ShoppingCart, Receipt, PictureAsPdf, Email } from "@mui/icons-material";

import { useAuth } from "../auth/AuthContext";
import PlantaService from "../services/PlantaService";
import VentaService from "../services/VentaService";
import DetalleVentaService from "../services/DetalleVentaService";
import PagoVentaService from "../services/PagoVentaService";

import {
  generarTicketPDF, 
  descargarTicket,
  descargarFactura,
  enviarPorCorreo
} from "../utils/pdfGenerator";

const EMPTY_LINE = { id_planta: "", cantidad: 1, precio_unitario: 0 };

const iframeStyle = {
  border: "none",
  borderRadius: "4px",
  backgroundColor: "#fff"
};

export default function NuevaVenta() {
  const { user } = useAuth();
  
  const [plantas, setPlantas] = useState([]);
  const [lineas, setLineas] = useState([{ ...EMPTY_LINE }]);
  const [formaPago, setFormaPago] = useState("efectivo");
  const [notaRemision, setNotaRemision] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");

  const [esAnticipo, setEsAnticipo] = useState(false);
  const [montoAnticipo, setMontoAnticipo] = useState("");
  const [montoPagado, setMontoPagado] = useState("");

  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  // Guardamos también los datos estáticos procesados para que el diálogo no dependa de estados volátiles limpiados
  const [ventaCreada, setVentaCreada] = useState(null);
  const [detallesCreados, setDetallesCreados] = useState([]);
  const [postDialog, setPostDialog] = useState(false);

  useEffect(() => {
    PlantaService.getAll()
      .then(setPlantas)
      .catch((err) => console.error("Error al cargar plantas:", err));
  }, []);

  const handleLineChange = (idx, field, value) => {
    setLineas((prev) => {
      const copy = [...prev];
      if (field === "id_planta") {
        copy[idx][field] = value === "" ? "" : Number(value);
        const planta = plantas.find((p) => p.id === Number(value));
        if (planta) {
          copy[idx].precio_unitario = planta.precio || 0;
        } else {
          copy[idx].precio_unitario = 0;
        }
      } else {
        copy[idx][field] = value === "" ? "" : Number(value);
      }
      return copy;
    });

    setErrores((p) => {
      const c = { ...p };
      delete c[`linea_${idx}`];
      return c;
    });
  };

  const addLine = () => setLineas((prev) => [...prev, { ...EMPTY_LINE }]);
  
  const removeLine = (idx) => {
    if (lineas.length > 1) {
      setLineas((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const calcSubtotal = (l) => (Number(l.cantidad) || 0) * (Number(l.precio_unitario) || 0);

  const totalCantidad = useMemo(() => {
    return lineas.reduce((s, l) => s + (Number(l.cantidad) || 0), 0);
  }, [lineas]);

  const total = useMemo(() => {
    return lineas.reduce((s, l) => s + calcSubtotal(l), 0);
  }, [lineas]);

  const tipoVenta = totalCantidad >= 1000 ? "mayoreo" : "menudeo";

  const cambio = useMemo(() => {
    if (esAnticipo || formaPago !== "efectivo" || !montoPagado) return 0;
    const rest = Number(montoPagado) - total;
    return rest > 0 ? rest : 0;
  }, [montoPagado, total, esAnticipo, formaPago]);

  const ticketSrcData = useMemo(() => {
    const lineasValidas = lineas.filter(l => l.id_planta !== "");
    if (total === 0 || lineasValidas.length === 0) return "";

    const detallesSimulados = lineasValidas.map((l) => {
      const p = plantas.find((pl) => pl.id === Number(l.id_planta));
      return {
        id_planta: Number(l.id_planta),
        nombre_planta: p ? p.nombre : `Planta #${l.id_planta}`,
        cantidad: Number(l.cantidad) || 0,
        precio_unitario: Number(l.precio_unitario) || 0,
        subtotal: calcSubtotal(l)
      };
    });

    const mAnticipo = esAnticipo ? (Number(montoAnticipo) || 0) : 0;
    const mPagado = esAnticipo ? mAnticipo : total;
    const saldoPendiente = esAnticipo ? Math.max(0, total - mAnticipo) : 0;

    const ventaSimulada = {
      id: ventaCreada?.id || 0, 
      fecha: new Date().toISOString(),
      forma_pago: formaPago,
      tipo_venta: tipoVenta,
      nota_remision: notaRemision,
      cliente_nombre: clienteNombre.trim(),
      cliente_telefono: clienteTelefono.trim(),
      cliente_email: clienteEmail.trim(),
      total: total,
      anticipo: mAnticipo,
      monto_pagado: mPagado,
      saldo_pendiente: saldoPendiente,
      estado: esAnticipo ? "con_anticipo" : "pagada",
      observaciones: observaciones
    };

    const pagosSimulados = [];
    if (esAnticipo && mAnticipo > 0) {
      pagosSimulados.push({
        fecha: new Date().toISOString(),
        tipo: "anticipo",
        forma_pago: formaPago,
        monto: mAnticipo,
        nota: "Anticipo de registro"
      });
    } else {
      pagosSimulados.push({
        fecha: new Date().toISOString(),
        tipo: "pago_completo",
        forma_pago: formaPago,
        monto: total,
        nota: "Liquidación total"
      });
    }

    try {
      const doc = generarTicketPDF({
        venta: ventaSimulada,
        detalles: detallesSimulados,
        pagos: pagosSimulados,
        vendedor: user?.nombre || "Admin"
      });
      return doc.output("datauristring");
    } catch (e) {
      console.error("Error generando preview de PDF:", e);
      return "";
    }
  }, [lineas, plantas, clienteNombre, clienteTelefono, clienteEmail, notaRemision, observaciones, formaPago, montoPagado, esAnticipo, montoAnticipo, total, tipoVenta, user, ventaCreada]);

  const validar = () => {
    const err = {};

    lineas.forEach((l, idx) => {
      const cantidadNum = Number(l.cantidad);
      const precioNum = Number(l.precio_unitario);

      if (!l.id_planta) {
        err[`linea_${idx}`] = "Selecciona una planta";
        return;
      }
      if (l.cantidad === "" || isNaN(cantidadNum) || cantidadNum <= 0) {
        err[`linea_${idx}`] = "Cantidad debe ser mayor a 0";
        return;
      }
      if (!Number.isInteger(cantidadNum)) {
        err[`linea_${idx}`] = "Cantidad debe ser un número entero";
        return;
      }
      if (l.precio_unitario === "" || isNaN(precioNum) || precioNum <= 0) {
        err[`linea_${idx}`] = "Precio inválido";
        return;
      }

      const planta = plantas.find((p) => p.id === Number(l.id_planta));
      if (planta && cantidadNum > planta.cantidad) {
        err[`linea_${idx}`] = `Stock insuficiente de "${planta.nombre}" (disponible: ${planta.cantidad})`;
      }
    });

    const idsUsados = lineas.filter((l) => l.id_planta).map((l) => Number(l.id_planta));
    const duplicados = idsUsados.filter((id, i) => idsUsados.indexOf(id) !== i);
    if (duplicados.length > 0) {
      err.duplicados = "Hay plantas repetidas en el detalle. Combínalas en una sola línea.";
    }

    if (esAnticipo) {
      const mAnticipo = Number(montoAnticipo);
      if (!montoAnticipo || isNaN(mAnticipo) || mAnticipo <= 0) {
        err.anticipo = "El monto del anticipo debe ser mayor a $0";
      } else if (mAnticipo >= total) {
        err.anticipo = 'El anticipo no puede ser igual o mayor al total del pedido. Desactiva "Anticipo" si liquidará la cuenta.';
      }
    } else {
      if (formaPago === "efectivo") {
        const pagadoNum = Number(montoPagado);
        if (!montoPagado || isNaN(pagadoNum)) {
          err.montoPagado = "Especifica la cantidad de efectivo que recibes";
        } else if (pagadoNum < total) {
          err.montoPagado = `Efectivo insuficiente. El total es de $${total.toFixed(2)} y recibiste $${pagadoNum.toFixed(2)}`;
        } else if (pagadoNum > total * 5) {
          err.montoPagado = "El monto ingresado parece excesivo para el total de la orden. Verifica la cantidad.";
        }
      }
    }

    const telefonoLimpio = clienteTelefono.replace(/[\s-]/g, "");
    if (clienteTelefono) {
      if (!/^\d+$/.test(telefonoLimpio)) {
        err.telefono = "El teléfono solo debe contener números";
      } else if (telefonoLimpio.length < 10 || telefonoLimpio.length > 13) {
        err.telefono = "El teléfono debe tener entre 10 y 13 dígitos";
      }
    }

    if (clienteEmail) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(clienteEmail.trim())) {
        err.email = "El formato del correo electrónico no es válido";
      }
    }

    if (total <= 0) err.total = "Agrega al menos un producto";

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validar()) return;

    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const anticipoMonto = esAnticipo ? Number(montoAnticipo) : 0;
      const cambioVal = formaPago === "efectivo" && !esAnticipo ? Math.max(0, Number(montoPagado) - total) : 0;
      const montoPagadoVal = esAnticipo ? anticipoMonto : total;
      const saldoPendiente = total - montoPagadoVal;

      // 1. Crear venta en Backend
      const venta = await VentaService.create({
        fecha: new Date().toISOString(),
        total,
        forma_pago: formaPago,
        tipo_venta: tipoVenta,
        id_usuario: user?.id || 1,
        nota_remision: notaRemision,
        observaciones,
        anticipo: anticipoMonto,
        monto_pagado: montoPagadoVal,
        saldo_pendiente: saldoPendiente,
        estado: saldoPendiente > 0 ? "con_anticipo" : "pagada",
        cliente_nombre: clienteNombre.trim(),
        cliente_telefono: clienteTelefono.replace(/[\s-]/g, "").trim(),
        cliente_email: clienteEmail.trim().toLowerCase(),
      });
      

      // Asegurar que usemos el ID real devuelto por la base de datos
      const idVentaGenerada = venta.id || venta.id_venta;

      // 2. Crear detalles en Backend
      const detalles = lineas.map((l) => ({
        id_venta: idVentaGenerada,
        id_planta: Number(l.id_planta),
        cantidad: Number(l.cantidad),
        precio_unitario: Number(l.precio_unitario),
        subtotal: calcSubtotal(l),
      }));
      await DetalleVentaService.createMultiple(detalles);

      // 3. Registrar pago en Backend
      const pagoNota = esAnticipo
        ? `Anticipo inicial de $${anticipoMonto.toFixed(2)}`
        : cambioVal > 0
          ? `Pago total · Cambio: $${cambioVal.toFixed(2)}`
          : "Pago total";

      await PagoVentaService.create({
        id_venta: idVentaGenerada,
        fecha: new Date().toISOString(),
        monto: montoPagadoVal,
        tipo: esAnticipo ? "anticipo" : "pago_completo",
        forma_pago: formaPago,
        nota: pagoNota,
        cambio: cambioVal,
      });

      // 4. Sincronizar Stock en Backend pasando el nuevo Stock absoluto
      for (const l of lineas) {
        const idLimpio = Number(l.id_planta);
        if (!idLimpio) continue;

        const planta = plantas.find((p) => Number(p.id) === idLimpio);
        if (planta) {
          const nuevoStock = Number(planta.cantidad) - Number(l.cantidad);
          // Modificado: pasamos el id y la propiedad envuelta tal cual espera tu endpoint PATCH
          await PlantaService.updateStock(idLimpio, nuevoStock);
        }
      }

      // Preparar el mapeo con nombres legibles para los PDF antes del reset del formulario
      const detallesConNombre = detalles.map((d) => ({
        ...d,
        nombre_planta: plantas.find((p) => p.id === d.id_planta)?.nombre || `#${d.id_planta}`,
      }));
      
      // Seteamos los estados que consumirá el Dialog modal de éxito
      const ventaDefinitiva = { ...venta, id: idVentaGenerada };
      setVentaCreada(ventaDefinitiva);
      setDetallesCreados(detallesConNombre);
      setPostDialog(true);

      const mensajeExito = `Venta #${idVentaGenerada} registrada — $${total.toFixed(2)} (${tipoVenta})`;
      setSuccess(mensajeExito);

      // 5. Reset del Formulario de forma segura
      setLineas([{ ...EMPTY_LINE }]);
      setNotaRemision("");
      setObservaciones("");
      setClienteNombre("");
      setClienteTelefono("");
      setClienteEmail("");
      setEsAnticipo(false);
      setMontoAnticipo("");
      setMontoPagado("");
      setErrores({});

      // Refrescar el inventario local para reflejar el stock disminuido
      const updated = await PlantaService.getAll();
      setPlantas(updated);
    } catch (e) {
      console.error(e);
      setError("Error al registrar la venta en el sistema.");
    } finally {
      setSaving(false);
    }
  };

  const handleDescargarTicket = () => {
    if (ventaCreada && detallesCreados.length) {
      descargarTicket(ventaCreada, detallesCreados, [], user?.nombre || "Admin");
    }
  };

  const handleDescargarFactura = () => {
    if (ventaCreada && detallesCreados.length) {
      descargarFactura(ventaCreada, detallesCreados, [], user?.nombre || "Admin");
    }
  };

  const handleEnviarCorreo = () => {
    if (ventaCreada && detallesCreados.length) {
      enviarPorCorreo(ventaCreada, detallesCreados, [], user?.nombre || "Admin", ventaCreada.cliente_email);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Nueva Venta
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, md: 7, lg: 8 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                Datos del Cliente (opcional)
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3, mt: 1 }}>
                <TextField 
                  label="Nombre del cliente" 
                  value={clienteNombre} 
                  onChange={(e) => setClienteNombre(e.target.value)} 
                  placeholder="Ej: Florería del Centro" 
                  sx={{ flex: 1, minWidth: 200 }} 
                  size="small" 
                />
                <TextField 
                  label="Teléfono" 
                  value={clienteTelefono} 
                  onChange={(e) => { setClienteTelefono(e.target.value); setErrores(p => ({...p, telefono: ""})); }} 
                  placeholder="7121234567" 
                  error={!!errores.telefono}
                  helperText={errores.telefono}
                  sx={{ minWidth: 150 }} 
                  size="small" 
                />
                <TextField 
                  label="Email" 
                  value={clienteEmail} 
                  onChange={(e) => { setClienteEmail(e.target.value); setErrores(p => ({...p, email: ""})); }} 
                  placeholder="cliente@correo.com" 
                  error={!!errores.email}
                  helperText={errores.email}
                  sx={{ flex: 1, minWidth: 200 }} 
                  size="small" 
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                Detalle de Productos
              </Typography>

              {errores.duplicados && <Alert severity="warning" sx={{ mb: 2 }}>{errores.duplicados}</Alert>}
              {errores.total && <Alert severity="warning" sx={{ mb: 2 }}>{errores.total}</Alert>}

              <Table size="small" sx={{ mb: 1 }}>
                <TableHead>
                  <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "action.hover" } }}>
                    <TableCell>Planta</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unit.</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell width={50} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineas.map((l, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          select
                          label="Seleccionar Planta"
                          value={l.id_planta}
                          onChange={(e) => handleLineChange(idx, "id_planta", e.target.value)}
                          size="small"
                          sx={{ minWidth: 220 }}
                          error={!!errores[`linea_${idx}`]}
                          helperText={errores[`linea_${idx}`]}
                          SelectProps={{
                            MenuProps: { PaperProps: { style: { maxHeight: 250 } } }
                          }}
                        >
                          <MenuItem value=""><em>— Seleccionar —</em></MenuItem>
                          {plantas.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.nombre} ({p.cantidad} disp.)
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell align="right">
                        <TextField 
                          type="number" 
                          value={l.cantidad} 
                          size="small" 
                          sx={{ width: 90 }} 
                          onChange={(e) => handleLineChange(idx, "cantidad", e.target.value)} 
                          inputProps={{ min: 1, step: 1 }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField 
                          type="number" 
                          value={l.precio_unitario} 
                          size="small" 
                          sx={{ width: 100 }} 
                          onChange={(e) => handleLineChange(idx, "precio_unitario", e.target.value)} 
                          inputProps={{ step: 0.5, min: 0 }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} variant="body2">${calcSubtotal(l).toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell>
                        {lineas.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => removeLine(idx)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 2 }}>
                <Button startIcon={<Add />} onClick={addLine} size="small" variant="text">Agregar línea</Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pr: 1 }}>
                  <Typography variant="body2" color="text.secondary">{totalCantidad.toLocaleString()} plantas</Typography>
                  <Typography variant="subtitle1" fontWeight={700} color="text.primary">Suma Total: <span style={{ marginLeft: '8px', color: '#1976d2', fontWeight: 800 }}>${total.toFixed(2)}</span></Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>Condiciones de Pago y Control</Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center", mt: 1, mb: 2 }}>
                <TextField 
                  select 
                  label="Forma de Pago" 
                  value={formaPago} 
                  onChange={(e) => { setFormaPago(e.target.value); setMontoPagado(""); setErrores(p => ({...p, montoPagado: ""})); }} 
                  size="small" 
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                  <MenuItem value="transferencia">Transferencia</MenuItem>
                </TextField>

                {!esAnticipo && formaPago === "efectivo" && (
                  <TextField 
                    label="Monto recibido" 
                    type="number" 
                    value={montoPagado} 
                    onChange={(e) => { setMontoPagado(e.target.value); setErrores(p => ({...p, montoPagado: ""})); }} 
                    size="small" 
                    error={!!errores.montoPagado}
                    helperText={errores.montoPagado}
                    sx={{ width: 150 }} 
                    InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: "text.secondary", fontSize: 14 }}>$</Typography> }} 
                  />
                )}
                <TextField label="Nota de Remisión" value={notaRemision} onChange={(e) => setNotaRemision(e.target.value)} placeholder="Ej: NR-002" size="small" sx={{ minWidth: 150 }} />
                <TextField label="Observaciones" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} size="small" sx={{ flex: 1, minWidth: 200 }} />
              </Box>

              <Box sx={{ mb: 2, bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                <FormControlLabel 
                  control={ <Switch checked={esAnticipo} onChange={(e) => { setEsAnticipo(e.target.checked); setMontoAnticipo(""); setErrores(p => ({...p, anticipo: ""})); }} color="warning" size="small" /> } 
                  label={<Typography variant="body2" fontWeight={500}>El cliente paga con anticipo</Typography>} 
                />
                <Collapse in={esAnticipo}>
                  <Box sx={{ mt: 1, pl: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField 
                      label="Monto del anticipo" 
                      type="number" 
                      value={montoAnticipo} 
                      onChange={(e) => { setMontoAnticipo(e.target.value); setErrores(p => ({...p, anticipo: ""})); }} 
                      size="small" 
                      error={!!errores.anticipo}
                      helperText={errores.anticipo}
                      sx={{ width: 180 }} 
                      InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: "text.secondary", fontSize: 14 }}>$</Typography> }} 
                    />
                  </Box>
                </Collapse>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography color="text.secondary" variant="body2">Subtotal bruto:</Typography>
                  <Typography fontWeight={500} variant="body2">${total.toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700}>Total Neto:</Typography>
                    <Chip label={tipoVenta === "mayoreo" ? "MAYOREO (≥1,000)" : "Menudeo"} size="small" color={tipoVenta === "mayoreo" ? "warning" : "default"} />
                    {esAnticipo && <Chip label="CON ANTICIPO" size="small" color="info" />}
                  </Box>
                  <Typography variant="h5" fontWeight={800} color="primary.main">${total.toFixed(2)}</Typography>
                </Box>

                {esAnticipo && Number(montoAnticipo) > 0 && Number(montoAnticipo) < total && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#fff3e0', p: 1.2, borderRadius: 1, mt: 1.5 }}>
                    <Typography variant="body2" color="warning.dark" fontWeight={600}>Anticipo: ${Number(montoAnticipo).toFixed(2)}</Typography>
                    <Typography variant="body2" color="warning.dark" fontWeight={700}>Resta por Liquidar: ${(total - Number(montoAnticipo)).toFixed(2)}</Typography>
                  </Box>
                )}

                {!esAnticipo && formaPago === "efectivo" && Number(montoPagado) >= total && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: '#e8f5e9', p: 1.2, borderRadius: 1, mt: 1.5 }}>
                    <Typography variant="body2" color="success.dark" fontWeight={600}>Efectivo Recibido: ${Number(montoPagado).toFixed(2)}</Typography>
                    <Typography variant="body2" color="success.dark" fontWeight={700}>Cambio al Cliente: ${cambio.toFixed(2)}</Typography>
                  </Box>
                )}
              </Box>

              <Button 
                variant="contained" 
                size="large" 
                startIcon={<ShoppingCart />} 
                onClick={handleSubmit} 
                disabled={saving || total === 0} 
                fullWidth 
                sx={{ mt: 3, py: 1.5, fontWeight: 'bold', borderRadius: 1.5 }}
              >
                {saving ? "Registrando Venta..." : "Registrar Venta"}
              </Button>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 5, lg: 4 }}>
          <Paper elevation={3} sx={{ p: 2, position: "sticky", top: 24, borderRadius: 2, bgcolor: "grey.100", textAlign: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 1.5 }}>
              <Receipt color="action" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>Previsualización del Ticket (80mm)</Typography>
            </Box>
            {ticketSrcData === "" ? (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: 450, bgcolor: "background.paper", borderRadius: 1, border: "2px dashed", borderColor: "divider", p: 3 }}>
                <Typography variant="body2" color="text.secondary">Agrega productos válidos para generar el borrador del ticket automáticamente.</Typography>
              </Box>
            ) : (
              <Box sx={{ bgcolor: "background.paper", borderRadius: 1, p: 0.5, boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <iframe 
                  title="Preview Ticket" 
                  src={`${ticketSrcData}#toolbar=0&navpanes=0&statusbar=0`} 
                  width="100%" 
                  height="500px" 
                  style={iframeStyle}
                />
              </Box>
            )}
          </Paper>
        </Grid2>
      </Grid2>

      <Dialog open={postDialog} onClose={() => setPostDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <Receipt sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
          <Typography variant="h6">Venta registrada con éxito</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 3 }}>
            ¿Qué deseas hacer con el comprobante de la Venta #{ventaCreada?.id}?
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleDescargarTicket} fullWidth>
              Descargar Ticket (formato mini)
            </Button>
            <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={handleDescargarFactura} fullWidth color="success">
              Descargar Factura (carta)
            </Button>
            {ventaCreada?.cliente_email && (
              <Button variant="outlined" startIcon={<Email />} onClick={handleEnviarCorreo} fullWidth color="info">
                Enviar por correo electrónico
              </Button>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button onClick={() => setPostDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}