import axios from 'axios';

// Configuración base de axios
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirigir al login si hay error de autenticación
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },
};

// Servicios de fisioterapeutas
export const fisioterapeutaService = {
  getActivos: async () => {
    const response = await api.get('/fisioterapeutas/activos');
    return response.data;
  },
  getInactivos: async () => {
    const response = await api.get('/fisioterapeutas/inactivos');
    return response.data;
  },
  getPendientesAlta: async () => {
    const response = await api.get('/fisioterapeutas/pendientes-alta');
    return response.data;
  },
  getPendientesBaja: async () => {
    const response = await api.get('/fisioterapeutas/pendientes-baja');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/fisioterapeutas/${id}`);
    return response.data;
  },
  create: async (fisioterapeuta: any) => {
    const response = await api.post('/fisioterapeutas', fisioterapeuta);
    return response.data;
  },
  update: async (id: number, fisioterapeuta: any) => {
    const response = await api.put(`/fisioterapeutas/${id}`, fisioterapeuta);
    return response.data;
  },
  darDeBaja: async (id: number, fecha_baja: string) => {
    const response = await api.post(`/fisioterapeutas/${id}/baja`, { fecha_baja });
    return response.data;
  },
  registrarNotificacionAlta: async (id: number) => {
    const response = await api.post(`/fisioterapeutas/${id}/notificacion-alta`);
    return response.data;
  },
  registrarNotificacionBaja: async (id: number) => {
    const response = await api.post(`/fisioterapeutas/${id}/notificacion-baja`);
    return response.data;
  },
  search: async (query: string, estado?: string) => {
    const response = await api.get('/fisioterapeutas/search', { params: { q: query, estado } });
    return response.data;
  },
};

// Servicios de contratos
export const contratoService = {
  getAll: async (fisioterapeuta_id?: number) => {
    const response = await api.get('/contratos', { params: { fisioterapeuta_id } });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/contratos/${id}`);
    return response.data;
  },
  upload: async (formData: FormData) => {
    const response = await api.post('/contratos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/contratos/${id}`);
    return response.data;
  },
};

// Servicios de notificaciones
export const notificacionService = {
  getAll: async (page = 1, limit = 10, tipo?: string, fisioterapeuta_id?: number) => {
    const response = await api.get('/notificaciones', {
      params: { page, limit, tipo, fisioterapeuta_id },
    });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/notificaciones/${id}`);
    return response.data;
  },
  enviarNotificacionesAlta: async (fisioterapeutas_ids: number[]) => {
    const response = await api.post('/notificaciones/enviar-altas', { fisioterapeutas_ids });
    return response.data;
  },
  enviarNotificacionesBaja: async (fisioterapeutas_ids: number[]) => {
    const response = await api.post('/notificaciones/enviar-bajas', { fisioterapeutas_ids });
    return response.data;
  },
};

// Servicios de plantillas
export const plantillaService = {
  getAll: async (includeInactive = false) => {
    const response = await api.get('/plantillas', { params: { includeInactive } });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/plantillas/${id}`);
    return response.data;
  },
  getByNombre: async (nombre: string) => {
    const response = await api.get(`/plantillas/nombre/${nombre}`);
    return response.data;
  },
  create: async (plantilla: any) => {
    const response = await api.post('/plantillas', plantilla);
    return response.data;
  },
  update: async (id: number, plantilla: any) => {
    const response = await api.put(`/plantillas/${id}`, plantilla);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/plantillas/${id}`);
    return response.data;
  },
  toggleActive: async (id: number, activo: boolean) => {
    const response = await api.patch(`/plantillas/${id}/toggle-active`, { activo });
    return response.data;
  },
};

// Servicios de destinatarios
export const destinatarioService = {
  getAll: async (includeInactive = false) => {
    const response = await api.get('/destinatarios', { params: { includeInactive } });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/destinatarios/${id}`);
    return response.data;
  },
  create: async (destinatario: any) => {
    const response = await api.post('/destinatarios', destinatario);
    return response.data;
  },
  update: async (id: number, destinatario: any) => {
    const response = await api.put(`/destinatarios/${id}`, destinatario);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/destinatarios/${id}`);
    return response.data;
  },
  toggleActive: async (id: number, activo: boolean) => {
    const response = await api.patch(`/destinatarios/${id}/toggle-active`, { activo });
    return response.data;
  },
};

// Servicios de usuarios
export const usuarioService = {
  getAll: async (includeInactive = false) => {
    const response = await api.get('/usuarios', { params: { includeInactive } });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },
  create: async (usuario: any) => {
    const response = await api.post('/usuarios', usuario);
    return response.data;
  },
  update: async (id: number, usuario: any) => {
    const response = await api.put(`/usuarios/${id}`, usuario);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },
  toggleActive: async (id: number, activo: boolean) => {
    const response = await api.patch(`/usuarios/${id}/toggle-active`, { activo });
    return response.data;
  },
};

// Servicios de configuración
export const configuracionService = {
  getAll: async () => {
    const response = await api.get('/configuracion');
    return response.data;
  },
  getByKey: async (clave: string) => {
    const response = await api.get(`/configuracion/${clave}`);
    return response.data;
  },
  getByPrefix: async (prefix: string) => {
    const response = await api.get(`/configuracion/prefix/${prefix}`);
    return response.data;
  },
  getEmailConfig: async () => {
    const response = await api.get('/configuracion/email');
    return response.data;
  },
  set: async (clave: string, valor: string, descripcion?: string) => {
    const response = await api.post('/configuracion', { clave, valor, descripcion });
    return response.data;
  },
  delete: async (clave: string) => {
    const response = await api.delete(`/configuracion/${clave}`);
    return response.data;
  },
};

export default api;
