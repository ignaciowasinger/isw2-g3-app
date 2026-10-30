import { api } from './http';
import type { Pedido, PedidoRequest } from '../types/api';

/** Público. El backend calcula precios, descuento, envío y total. */
export const crearPedido = (datos: PedidoRequest) =>
  api.post<Pedido>('/api/pedidos', datos, { auth: false });

/** Público. Devuelve el estado sin teléfono ni dirección. */
export const consultarSeguimiento = (codigo: string) =>
  api.get<Pedido>(`/api/pedidos/seguimiento/${encodeURIComponent(codigo)}`, { auth: false });
