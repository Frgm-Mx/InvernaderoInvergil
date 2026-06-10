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
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete, Science } from "@mui/icons-material";
import AbonoService from "../services/AbonoService";
import { useAuth } from "../auth/AuthContext";

const EMPTY = { nombre: "", uso: "", cantidad: "" };

export default function Abonos() {
  const { user } = useAuth();
  const esAdmin = user?.rol === "administradora" || user?.rol === "admin";

  const [abonos, setAbonos] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState("");
  const [errorGlobal, setErrorGlobal] = useState("");

  const load = async () => {
    try {
      const data = await AbonoService.getAll();
      // Ordenar por id descendente (más recientes primero)
      const ordenados = data.sort((a, b) => b.id - a.id);
      setAbonos(ordenados);
    } catch (error) {
      console.error("Error al cargar:", error);
      setErrorGlobal("Error al cargar fertilizantes");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpen = (item = null) => {
    if (item) {
      setForm({
        nombre: item.nombre || "",
        uso: item.uso || "",
        cantidad: item.cantidad || "",
      });
      setEditId(item.id);
    } else {
      setForm(EMPTY);
      setEditId(null);
    }
    setOpen(true);
    setErrores({});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: "" });
  };

  const validar = () => {
    const err = {};
    if (!form.nombre?.trim()) err.nombre = "El nombre es obligatorio";
    if (!form.uso?.trim()) err.uso = "El uso es obligatorio";
    if (!form.cantidad || form.cantidad <= 0)
      err.cantidad = "Cantidad debe ser mayor a 0";
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validar()) return;

    const payload = {
      nombre: form.nombre.trim(),
      uso: form.uso.trim(),
      cantidad: Number(form.cantidad),
    };

    try {
      if (editId) {
        await AbonoService.update(editId, payload);
        setMsg("Fertilizante actualizado correctamente");
      } else {
        await AbonoService.create(payload);
        setMsg("Fertilizante registrado correctamente");
      }
      setOpen(false);
      load();
    } catch (error) {
      console.error("Error al guardar:", error);
      setErrores({ global: "Error al guardar el fertilizante" });
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await AbonoService.delete(id);
      setMsg("Fertilizante eliminado correctamente");
      load();
    } catch (error) {
      console.error("Error al eliminar:", error);
      setErrorGlobal("Error al eliminar el fertilizante");
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
            Fertilizantes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {abonos.length} productos en inventario
          </Typography>
        </Box>
        {esAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
            color="success"
          >
            Nuevo Fertilizante
          </Button>
        )}
      </Box>

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
                <TableCell>Nombre</TableCell>
                <TableCell>Uso / Aplicación</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell>Registro</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {abonos.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Science sx={{ color: "success.main", fontSize: 20 }} />
                      <Typography variant="body2" fontWeight={600}>
                        {item.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{item.uso || "—"}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${item.cantidad} kg`}
                      size="small"
                      color={item.cantidad < 5 ? "error" : "info"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {formatFecha(item.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {esAdmin ? (
                      <>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(item)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item.id, item.nombre)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Solo administradores
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {abonos.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    No hay fertilizantes registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog para crear/editar */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editId ? "Editar Fertilizante" : "Nuevo Fertilizante"}
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          {errores.global && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errores.global}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nombre del fertilizante *"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={!!errores.nombre}
              helperText={errores.nombre}
              fullWidth
            />
            <TextField
              label="Uso / Aplicación *"
              name="uso"
              value={form.uso}
              onChange={handleChange}
              placeholder="Ej: Floración, Crecimiento, Control de plagas"
              error={!!errores.uso}
              helperText={errores.uso}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Cantidad (kg/l) *"
              name="cantidad"
              type="number"
              value={form.cantidad}
              onChange={handleChange}
              error={!!errores.cantidad}
              cf
              helperText={errores.cantidad}
              inputProps={{ min: 0, step: 0.5 }}
              fullWidth
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
