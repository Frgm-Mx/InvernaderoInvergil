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
  MenuItem,
  Alert,
  Chip,
} from "@mui/material";
import { Add, Edit, Delete, PersonOutline } from "@mui/icons-material";
import UsuarioService from "../services/UsuarioService";
import { useAuth } from "../auth/AuthContext";

const EMPTY = { nombre: "", usuario: "", password: "", rol: "empleado" };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [errores, setErrores] = useState({});
  const [msg, setMsg] = useState("");
  const [errorGlobal, setErrorGlobal] = useState("");
  const { user } = useAuth();
  const esAdmin = user?.rol === "administradora" || user?.rol === "admin";

  const load = async () => {
    try {
      setUsuarios(await UsuarioService.getAll());
    } catch {
      setErrorGlobal("Error al cargar usuarios");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpen = (u = null) => {
    if (u) {
      // Extraemos la contraseña si viene del backend para no arrastrarla al formulario
      const { password, ...usuarioSinPassword } = u;
      setForm({ ...usuarioSinPassword, password: "" });
      setEditId(u.id);
    } else {
      setForm(EMPTY);
      setEditId(null);
    }
    setOpen(true);
    setErrores({});
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrores((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validar = () => {
    const err = {};
    if (!form.nombre.trim()) err.nombre = "El nombre es obligatorio";
    else if (form.nombre.trim().length < 3) err.nombre = "Mínimo 3 caracteres";

    if (!form.usuario.trim()) err.usuario = "El usuario es obligatorio";
    else if (form.usuario.trim().length < 3)
      err.usuario = "Mínimo 3 caracteres";
    else if (/\s/.test(form.usuario.trim()))
      err.usuario = "No se permiten espacios";

    if (!editId) {
      if (!form.password) err.password = "La contraseña es obligatoria";
      else if (form.password.length < 4) err.password = "Mínimo 4 caracteres";
    } else if (form.password && form.password.length < 4) {
      err.password = "Mínimo 4 caracteres";
    }

    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSave = async () => {
    if (!validar()) return;

    // Construimos un payload limpio
    const payload = {
      nombre: form.nombre.trim(),
      usuario: form.usuario.trim(),
      rol: form.rol,
    };

    // Solo adjuntamos la contraseña si se escribió algo en ella
    if (form.password && form.password.trim() !== "") {
      payload.password = form.password;
    }

    try {
      if (editId) {
        await UsuarioService.update(editId, payload);
        setMsg("Usuario actualizado");
      } else {
        await UsuarioService.create(payload);
        setMsg("Usuario creado");
      }
      setOpen(false);
      load();
    } catch {
      setErrores({ global: "Error al guardar el usuario. Intente de nuevo." });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await UsuarioService.delete(id);
      setMsg("Usuario eliminado");
      load();
    } catch {
      setErrorGlobal("Error al eliminar");
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
        }}
      >
        <Typography variant="h4">Usuarios</Typography>
        {esAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            Nuevo Usuario
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
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PersonOutline
                        sx={{ color: "primary.main", fontSize: 20 }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {u.nombre}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{u.usuario}</TableCell>
                  <TableCell>
                    <Chip
                      label={u.rol}
                      size="small"
                      color={u.rol === "administradora" ? "primary" : "default"}
                      sx={{ textTransform: "capitalize" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {esAdmin ? (
                      <>
                        <IconButton size="small" onClick={() => handleOpen(u)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(u.id)}
                          disabled={u.id === user?.id}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Sin permisos
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{editId ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          {errores.global && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errores.global}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nombre Completo *"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              error={!!errores.nombre}
              helperText={errores.nombre}
            />
            <TextField
              label="Usuario *"
              name="usuario"
              value={form.usuario}
              onChange={handleChange}
              error={!!errores.usuario}
              helperText={errores.usuario}
            />
            <TextField
              label={
                editId
                  ? "Nueva Contraseña (dejar vacío = no cambiar)"
                  : "Contraseña *"
              }
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={!!errores.password}
              helperText={errores.password}
            />
            <TextField
              select
              label="Rol"
              name="rol"
              value={form.rol}
              onChange={handleChange}
            >
              <MenuItem value="administradora">Administradora</MenuItem>
              <MenuItem value="empleado">Empleado</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
