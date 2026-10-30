import { api } from './http';
import type {
  EstadoPedido,
  PedidoDetalle,
  PedidoResumen,
  RepartidorEnCalle,
} from '../types/api';

/** Sin estado, el backend devuelve los pedidos no terminados. */
export const listarPedidos = (estado?: EstadoPedido | null) =>
  api.get<PedidoResumen[]>(
    `/api/pedidos${estado ? `?estado=${encodeURIComponent(estado)}` : ''}`,
    { auth: true },
  );

export const obtenerPedido = (id: number) =>
  api.get<PedidoDetalle>(`/api/pedidos/${id}`, { auth: true });

/** El repartidor solo se envía al pasar a EN_CAMINO. */
export const avanzarPedido = (id: number, repartidorId?: number) =>
  api.post<PedidoDetalle>(
    `/api/pedidos/${id}/avanzar`,
    repartidorId ? { repartidorId } : {},
    { auth: true },
  );

export const cancelarPedido = (id: number) =>
  api.post<PedidoDetalle>(`/api/pedidos/${id}/cancelar`, undefined, { auth: true });

export const obtenerEnCalle = () =>
  api.get<RepartidorEnCalle[]>('/api/pedidos/en-calle', { auth: true });
