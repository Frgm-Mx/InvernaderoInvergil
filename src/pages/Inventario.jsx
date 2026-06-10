import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Tooltip,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Yard,
  Search,
  ImportExport,
  Restore,
} from "@mui/icons-material";
import PlantaService from "../services/PlantaService";
import { useAuth } from "../auth/AuthContext";

const EMPTY = {
  nombre: "",
  tipo: "",
  cantidad: "",
  precio: "",
  costo_produccion: "",
  costo_compra: "",
  cultivada_vivero: true,
  descripcion: "",
  activo: true,
};

export default function Inventario() {
  const { user } = useAuth();
  const esAdmin = user?.rol === "administradora" || user?.rol === "admin";
  const [plantas, setPlantas] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState("");
  const [errorGlobal, setErrorGlobal] = useState("");
  const [costoTotal, setCostoTotal] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("recientes");
  const [mostrarInactivas, setMostrarInactivas] = useState(false);

  const load = async () => {
    try {
      const todas =
        (await PlantaService.getAllIncludingInactive?.()) ||
        (await PlantaService.getAll());
      setPlantas(todas);
    } catch {
      setErrorGlobal("Error al cargar inventario");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Sincronizar costo total cuando cambian cantidad o costo unitario
  useEffect(() => {
    const cantidad = Number(form.cantidad) || 0;
    const costoUnitario = form.cultivada_vivero
      ? Number(form.costo_produccion) || 0
      : Number(form.costo_compra) || 0;

    if (cantidad > 0 && costoUnitario > 0) {
      setCostoTotal((cantidad * costoUnitario).toFixed(2));
    } else {
      setCostoTotal("");
    }
  }, [
    form.cantidad,
    form.costo_produccion,
    form.costo_compra,
    form.cultivada_vivero,
  ]);

  const plantasProcesadas = plantas
    .filter((p) => {
      const matchBusqueda = p.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase().trim());
      const matchEstado = mostrarInactivas ? true : p.activo !== false;
      return matchBusqueda && matchEstado;
    })
    .sort((a, b) => (orden === "recientes" ? b.id - a.id : a.id - b.id));

  const verificarSiTieneVentas = async (idPlanta) => {
    try {
      const response = await PlantaService.tieneVentas?.(idPlanta);
      return response?.tieneVentas || false;
    } catch (error) {
      console.error("Error verificando ventas:", error);
      return false;
    }
  };

  const deshabilitarPlanta = async (id) => {
    try {
      await PlantaService.deshabilitar?.(id);
      setMsg(`✓ Planta deshabilitada correctamente`);
      load();
    } catch (error) {
      setErrorGlobal(error.response?.data?.error || "Error al deshabilitar");
    }
  };

  const reactivarPlanta = async (id) => {
    try {
      await PlantaService.reactivar?.(id);
      setMsg(`✓ Planta reactivada correctamente`);
      load();
    } catch (error) {
      setErrorGlobal(error.response?.data?.error || "Error al reactivar");
    }
  };

  const eliminarPlantaPermanentemente = async (id) => {
    try {
      await PlantaService.delete(id);
      setMsg(`✓ Planta eliminada permanentemente`);
      load();
    } catch (error) {
      setErrorGlobal(error.response?.data?.error || "Error al eliminar");
    }
  };

  const handleDelete = async (id) => {
    const planta = plantas.find((p) => p.id === id);
    if (!planta) return;

    const tieneVentas = await verificarSiTieneVentas(id);

    if (tieneVentas) {
      const confirmar = window.confirm(
        `⚠️ ADVERTENCIA: La planta "${planta.nombre}" tiene ventas registradas.\n\n` +
          `Si la deshabilitas, ya no aparecerá en nuevas ventas pero se mantendrá en el historial.\n\n` +
          `¿Deseas deshabilitar esta planta?`,
      );

      if (confirmar) {
        await deshabilitarPlanta(id);
      }
    } else {
      const confirmar = window.confirm(
        `¿Eliminar "${planta.nombre}" permanentemente?\n` +
          `Esta acción no se puede deshacer.`,
      );

      if (confirmar) {
        await eliminarPlantaPermanentemente(id);
      }
    }
  };

  const validarCampo = (name, value, formularioActual) => {
    const errs = { ...errores };

    if (name === "nombre") {
      const val = value.trim();
      if (!val) {
        errs.nombre = "El nombre es obligatorio";
      } else if (val.length < 2) {
        errs.nombre = "Mínimo 2 caracteres";
      } else {
        const existe = plantas.some(
          (p) =>
            p.nombre.trim().toLowerCase() === val.toLowerCase() &&
            p.id !== editId &&
            p.activo !== false,
        );
        if (existe) {
          errs.nombre = "Esta planta ya existe en el inventario";
        } else {
          delete errs.nombre;
        }
      }
    }

    if (name === "tipo") {
      if (!value.trim()) errs.tipo = "El tipo es obligatorio";
      else delete errs.tipo;
    }

    if (name === "cantidad") {
      if (value === "" || value === null) {
        errs.cantidad = "La cantidad es obligatoria";
      } else if (Number(value) < 0) {
        errs.cantidad = "No puede ser negativa";
      } else if (!Number.isInteger(Number(value))) {
        errs.cantidad = "Debe ser un número entero";
      } else {
        delete errs.cantidad;
      }
    }

    if (
      name === "precio" ||
      name === "costo_produccion" ||
      name === "costo_compra" ||
      name === "cultivada_vivero"
    ) {
      const precio =
        name === "precio" ? Number(value) : Number(formularioActual.precio);
      const costoProd =
        name === "costo_produccion"
          ? Number(value)
          : Number(formularioActual.costo_produccion);
      const costoComp =
        name === "costo_compra"
          ? Number(value)
          : Number(formularioActual.costo_compra);
      const esCultivada =
        name === "cultivada_vivero" ? value : formularioActual.cultivada_vivero;
      const costoActual = esCultivada ? costoProd : costoComp;

      if (name === "precio" && (!value || precio <= 0)) {
        errs.precio = "El precio debe ser mayor a $0";
      } else if (name === "precio") {
        delete errs.precio;
      }

      if (name === "costo_produccion" && costoProd < 0) {
        errs.costo_produccion = "No puede ser negativo";
      } else if (name === "costo_produccion") {
        delete errs.costo_produccion;
      }

      if (name === "costo_compra" && costoComp < 0) {
        errs.costo_compra = "No puede ser negativo";
      } else if (name === "costo_compra") {
        delete errs.costo_compra;
      }

      if (precio > 0 && costoActual >= precio) {
        errs.precio = "El precio de venta no puede ser menor o igual al costo";
        if (esCultivada)
          errs.costo_produccion = "El costo debe ser menor al precio";
        else errs.costo_compra = "El costo debe ser menor al precio";
      } else {
        if (
          errs.precio ===
          "El precio de venta no puede ser menor o igual al costo"
        )
          delete errs.precio;
        if (errs.costo_produccion === "El costo debe ser menor al precio")
          delete errs.costo_produccion;
        if (errs.costo_compra === "El costo debe ser menor al precio")
          delete errs.costo_compra;
      }
    }

    if (name === "descripcion" || name === "precio") {
      const precio =
        name === "precio" ? Number(value) : Number(formularioActual.precio);
      const descripcion =
        name === "descripcion" ? value : formularioActual.descripcion;
      if (precio >= 1000 && !descripcion.trim()) {
        errs.descripcion =
          "Es obligatorio agregar descripción para plantas de alto valor";
      } else {
        delete errs.descripcion;
      }
    }

    setErrores(errs);
    return errs;
  };

  const handleOpen = (planta = null) => {
    if (planta) {
      setForm({ ...planta });
      setEditId(planta.id);
      const cantidad = Number(planta.cantidad) || 0;
      const costoUnitario = planta.cultivada_vivero
        ? Number(planta.costo_produccion) || 0
        : Number(planta.costo_compra) || 0;
      setCostoTotal((cantidad * costoUnitario).toFixed(2));
    } else {
      setForm(EMPTY);
      setEditId(null);
      setCostoTotal("");
    }
    setOpen(true);
    setErrores({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const valorFinal = type === "checkbox" ? checked : value;

    setForm((f) => {
      const nuevoForm = { ...f, [name]: valorFinal };
      validarCampo(name, valorFinal, nuevoForm);
      return nuevoForm;
    });
  };

  const handleCostoTotalChange = (e) => {
    const totalInput = e.target.value;
    setCostoTotal(totalInput);

    const cantidad = Number(form.cantidad) || 0;
    const campoDestino = form.cultivada_vivero
      ? "costo_produccion"
      : "costo_compra";

    if (totalInput === "") {
      setForm((f) => ({ ...f, [campoDestino]: "" }));
      return;
    }

    const totalNum = Number(totalInput);
    if (cantidad > 0 && !isNaN(totalNum) && totalNum > 0) {
      const unitarioCalculado = (totalNum / cantidad).toFixed(2);
      setForm((f) => {
        const nuevoForm = { ...f, [campoDestino]: unitarioCalculado };
        validarCampo(campoDestino, unitarioCalculado, nuevoForm);
        return nuevoForm;
      });
    }
  };

  const validarAlGuardar = () => {
    let erroresFinales = { ...errores };
    const camposARevisar = [
      "nombre",
      "tipo",
      "cantidad",
      "precio",
      form.cultivada_vivero ? "costo_produccion" : "costo_compra",
      "descripcion",
    ];

    camposARevisar.forEach((campo) => {
      erroresFinales = validarCampo(campo, form[campo], form);
    });

    if (!form.nombre.trim()) erroresFinales.nombre = "El nombre es obligatorio";
    if (!form.tipo.trim()) erroresFinales.tipo = "El tipo es obligatorio";
    if (form.cantidad === "")
      erroresFinales.cantidad = "La cantidad es obligatoria";
    if (!form.precio) erroresFinales.precio = "El precio es obligatorio";

    setErrores(erroresFinales);
    return Object.keys(erroresFinales).length === 0;
  };

  const handleSave = async () => {
    if (!validarAlGuardar()) return;

    const payload = {
      nombre: form.nombre.trim(),
      tipo: form.tipo.trim(),
      cantidad: Number(form.cantidad),
      precio: Number(form.precio),
      cultivada_vivero: form.cultivada_vivero,
      costo_produccion: form.cultivada_vivero
        ? Number(form.costo_produccion) || 0
        : 0,
      costo_compra: !form.cultivada_vivero ? Number(form.costo_compra) || 0 : 0,
      descripcion: (form.descripcion || "").trim(),
      activo: form.activo !== undefined ? form.activo : true,
    };

    try {
      if (editId) {
        await PlantaService.update(editId, payload);
        setMsg("Planta actualizada con éxito");
      } else {
        await PlantaService.create(payload);
        setMsg("Planta registrada con éxito");
      }
      setOpen(false);
      load();
    } catch {
      setErrores({ global: "Error al procesar la solicitud." });
    }
  };

  const cantidadActual = Number(form.cantidad) || 0;
  const costoUnitarioActual = form.cultivada_vivero
    ? Number(form.costo_produccion) || 0
    : Number(form.costo_compra) || 0;
  const precioSugerido =
    costoUnitarioActual > 0 ? (costoUnitarioActual * 1.4).toFixed(2) : null;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Inventario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {plantasProcesadas.length} tipos ·{" "}
            {plantasProcesadas
              .reduce((s, p) => s + p.cantidad, 0)
              .toLocaleString()}{" "}
            unidades
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
          color="success"
          disabled={!esAdmin}
        >
          Nueva Planta
        </Button>
      </Box>

      {/* Barra de Filtros */}
      <Card
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          label="Buscar por nombre..."
          variant="outlined"
          size="small"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ flexGrow: 1, minWidth: "200px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Ordenar por"
          variant="outlined"
          size="small"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          sx={{ minWidth: "220px" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ImportExport fontSize="small" />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="recientes">
            Más recientes primero (Nuevas arriba)
          </MenuItem>
          <MenuItem value="antiguas">Más antiguas primero</MenuItem>
        </TextField>
        <FormControlLabel
          control={
            <Switch
              checked={mostrarInactivas}
              onChange={(e) => setMostrarInactivas(e.target.checked)}
              size="small"
            />
          }
          label="Mostrar inactivas"
        />
      </Card>

      {msg && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setMsg("")}
        >
          {msg}
        </Alert>
      )}
      {errorGlobal && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setErrorGlobal("")}
        >
          {errorGlobal}
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{ "& th": { fontWeight: 700, bgcolor: "grey.50" } }}
              >
                <TableCell>Planta</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Venta</TableCell>
                <TableCell align="right">Costo Unitario</TableCell>
                <TableCell align="right">Inversión Total</TableCell>
                <TableCell>Origen</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plantasProcesadas.map((p) => {
                const cUnitario = p.cultivada_vivero
                  ? p.costo_produccion
                  : p.costo_compra;
                const cTotal = p.cantidad * cUnitario;
                const isActive = p.activo !== false;

                return (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      opacity: isActive ? 1 : 0.6,
                      backgroundColor: !isActive ? "action.hover" : "inherit",
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Yard sx={{ color: "success.main", fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={600}>
                          {p.nombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{p.tipo}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={p.cantidad.toLocaleString()}
                        size="small"
                        color={
                          p.cantidad < 20
                            ? "error"
                            : p.cantidad < 100
                              ? "warning"
                              : "success"
                        }
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ${Number(p.precio).toFixed(2)}
                    </TableCell>
                    <TableCell align="right" color="text.secondary">
                      ${cUnitario.toFixed(2)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "text.secondary", fontStyle: "italic" }}
                    >
                      ${cTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.cultivada_vivero ? "Cultivada" : "Comprada"}
                        size="small"
                        color={p.cultivada_vivero ? "success" : "info"}
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isActive ? "Activa" : "Inactiva"}
                        size="small"
                        color={isActive ? "success" : "default"}
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {esAdmin ? (
                        <>
                          <Tooltip title={isActive ? "Editar" : "Ver detalles"}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpen(p)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={isActive ? "Deshabilitar" : "Reactivar"}
                          >
                            <IconButton
                              size="small"
                              color={isActive ? "error" : "success"}
                              onClick={() => handleDelete(p.id)}
                            >
                              {isActive ? (
                                <Delete fontSize="small" />
                              ) : (
                                <Restore fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Solo administradores pueden editar">
                          <IconButton size="small" disabled>
                            <Edit fontSize="small" color="disabled" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {plantasProcesadas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    No se encontraron plantas coincidentes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog crear/editar */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editId ? "Editar Planta" : "Nueva Planta"}</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          {errores.global && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errores.global}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nombre *"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={!!errores.nombre}
              helperText={errores.nombre}
            />
            <TextField
              label="Tipo *"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              placeholder="Ej: Flor, Arbusto"
              error={!!errores.tipo}
              helperText={errores.tipo}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Cantidad *"
                name="cantidad"
                type="number"
                value={form.cantidad}
                onChange={handleChange}
                error={!!errores.cantidad}
                helperText={errores.cantidad}
                inputProps={{ min: 0, step: 1 }}
                fullWidth
              />
              <Box sx={{ width: "100%" }}>
                <TextField
                  label="Precio Venta *"
                  name="precio"
                  type="number"
                  value={form.precio}
                  onChange={handleChange}
                  error={!!errores.precio}
                  helperText={errores.precio}
                  inputProps={{ step: 0.5, min: 0.5 }}
                  fullWidth
                />
                {precioSugerido && (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{
                      display: "block",
                      mt: 0.5,
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => {
                      const e = {
                        target: { name: "precio", value: precioSugerido },
                      };
                      handleChange(e);
                    }}
                  >
                    💡 Sugerido (+40%): ${precioSugerido}
                  </Typography>
                )}
              </Box>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={form.cultivada_vivero}
                  onChange={handleChange}
                  name="cultivada_vivero"
                  color="success"
                />
              }
              label={
                form.cultivada_vivero
                  ? "Cultivada en el vivero"
                  : "Comprada a proveedor externo"
              }
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              {form.cultivada_vivero ? (
                <TextField
                  label="Costo de Producción (Unitario) *"
                  name="costo_produccion"
                  type="number"
                  value={form.costo_produccion}
                  onChange={handleChange}
                  fullWidth
                  error={!!errores.costo_produccion}
                  helperText={errores.costo_produccion}
                  inputProps={{ step: "any" }}
                />
              ) : (
                <TextField
                  label="Costo de Compra (Unitario) *"
                  name="costo_compra"
                  type="number"
                  value={form.costo_compra}
                  onChange={handleChange}
                  fullWidth
                  error={!!errores.costo_compra}
                  helperText={errores.costo_compra}
                  inputProps={{ step: "any" }}
                />
              )}

              <TextField
                label="Costo Total del Lote"
                type="number"
                fullWidth
                inputProps={{ step: "any" }}
                value={costoTotal}
                onChange={handleCostoTotalChange}
                InputLabelProps={{ shrink: true }}
                helperText="Escribe aquí el total para autocalcular el unitario"
              />
            </Box>

            <TextField
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              multiline
              rows={2}
              error={!!errores.descripcion}
              helperText={errores.descripcion}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} color="success">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
