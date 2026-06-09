import API from './api'

const PagoVentaService = {
  getAll: async () => {
    const { data } = await API.get('/api/pagos-venta');  // ← Cambiado
    return data;
  },

  getByVenta: async (idVenta) => {
    try {
      // Cambiar la URL para que coincida con el backend
      const { data } = await API.get(`/api/pagos-venta/venta/${idVenta}`);  // ← Cambiado
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error obteniendo pagos de venta ${idVenta}:`, error);
      return [];
    }
  },

  getById: async (id) => {
    const { data } = await API.get(`/api/pagos-venta/${id}`);  // ← Cambiado
    return data;
  },

  create: async (pago) => {
    const { data } = await API.post('/api/pagos-venta', pago);  // ← Cambiado
    return data;
  },

  update: async (id, pago) => {
    const { data } = await API.put(`/api/pagos-venta/${id}`, pago);  // ← Cambiado
    return data;
  },

  delete: async (id) => {
    const { data } = await API.delete(`/api/pagos-venta/${id}`);  // ← Cambiado
    return data;
  }
};

export default PagoVentaService;