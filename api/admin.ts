import { api } from './http';
import type {
  Local,
  LocalForm,
  Producto,
  ProductoForm,
  Usuario,
  UsuarioCrear,
  UsuarioEditar,
  VentaLocal,
} from '../types/api';

// RF-02 Usuarios (solo ADMIN)
export const listarUsuarios = () => api.get<Usuario[]>('/api/admin/usuarios', { auth: true });

export const obtenerUsuario = (id: number) =>
  api.get<Usuario>(`/api/admin/usuarios/${id}`, { auth: true });

export const crearUsuario = (datos: UsuarioCrear) =>
  api.post<Usuario>('/api/admin/usuarios', datos, { auth: true });

export const editarUsuario = (id: number, datos: UsuarioEditar) =>
  api.put<Usuario>(`/api/admin/usuarios/${id}`, datos, { auth: true });

// RF-03 Locales
export const listarLocalesAdmin = () => api.get<Local[]>('/api/admin/locales', { auth: true });

export const obtenerLocalAdmin = (id: number) =>
  api.get<Local>(`/api/admin/locales/${id}`, { auth: true });

export const crearLocal = (datos: LocalForm) =>
  api.post<Local>('/api/admin/locales', datos, { auth: true });

export const editarLocal = (id: number, datos: LocalForm) =>
  api.put<Local>(`/api/admin/locales/${id}`, datos, { auth: true });

// RF-04 Productos
export const listarProductosAdmin = () =>
  api.get<Producto[]>('/api/admin/productos', { auth: true });

export const obtenerProductoAdmin = (id: number) =>
  api.get<Producto>(`/api/admin/productos/${id}`, { auth: true });

export const crearProducto = (datos: ProductoForm) =>
  api.post<Producto>('/api/admin/productos', datos, { auth: true });

export const editarProducto = (id: number, datos: ProductoForm) =>
  api.put<Producto>(`/api/admin/productos/${id}`, datos, { auth: true });

// RF-11 Ventas por local
export const obtenerVentas = (desde: string, hasta: string) =>
  api.get<VentaLocal[]>(
    `/api/admin/ventas?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`,
    { auth: true },
  );
