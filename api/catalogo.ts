import { api } from './http';
import type { Carta, Categoria, Local } from '../types/api';

/** Locales activos con su carta. Rutas públicas. */
export const obtenerLocales = () => api.get<Local[]>('/api/locales', { auth: false });

export const obtenerCarta = (localId: number) =>
  api.get<Carta>(`/api/locales/${localId}/carta`, { auth: false });

export const obtenerCategorias = () => api.get<Categoria[]>('/api/categorias', { auth: false });
