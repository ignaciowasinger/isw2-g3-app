// Tipos espejo de los DTO del backend (com.example.backendprojt.dto).
// Los importes llegan ya calculados por el servidor: la app solo los muestra.

export type Rol = 'ADMIN' | 'OPERADOR';

export type EstadoPedido =
  | 'RECIBIDO'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

/** Formato único de error del backend (ApiError.java). */
export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  detalles?: string[];
}

// ---- Autenticación ----
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  nombreCompleto: string;
  /** Alias de nombreCompleto, el que consume la app. */
  nombre: string;
  rol: Rol;
}

// ---- Catálogo público ----
export interface Local {
  id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  activo: boolean;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  localId: number;
  localNombre: string;
  categoriaId: number;
  categoriaNombre: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  disponible: boolean;
  activo: boolean;
}

export interface CategoriaCarta {
  id: number;
  nombre: string;
  productos: Producto[];
}

export interface Carta {
  localId: number;
  localNombre: string;
  categorias: CategoriaCarta[];
}

// ---- Pedidos ----
export interface PedidoRequest {
  localId: number;
  nombre: string;
  telefono: string;
  direccionEntrega: string;
  items: { productoId: number; cantidad: number }[];
}

export interface PedidoItem {
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

/** Respuesta de crear pedido y de la consulta pública por código (PedidoResponse). */
export interface Pedido {
  codigoSeguimiento: string;
  estado: EstadoPedido;
  localNombre: string;
  fechaHora: string;
  items: PedidoItem[];
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
}

export interface PedidoResumen {
  id: number;
  codigoSeguimiento: string;
  estado: EstadoPedido;
  localNombre: string;
  clienteNombre: string;
  repartidorNombre: string | null;
  fechaHora: string;
  total: number;
}

export interface PedidoDetalle {
  id: number;
  codigoSeguimiento: string;
  estado: EstadoPedido;
  localId: number;
  localNombre: string;
  clienteNombre: string;
  clienteTelefono: string;
  direccionEntrega: string;
  repartidorId: number | null;
  repartidorNombre: string | null;
  fechaHora: string;
  items: PedidoItem[];
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
}

export interface RepartidorEnCalle {
  repartidorId: number;
  nombreCompleto: string;
  cantidadEnCamino: number;
  codigosPedidos: string[];
}

// ---- Administración ----
export interface Usuario {
  id: number;
  username: string;
  nombreCompleto: string;
  rol: Rol;
  activo: boolean;
  fechaAlta: string;
}

export interface UsuarioCrear {
  username: string;
  password: string;
  nombreCompleto: string;
  rol: Rol;
}

export interface UsuarioEditar {
  nombreCompleto: string;
  rol: Rol;
  activo: boolean;
  password?: string;
}

export interface LocalForm {
  nombre: string;
  direccion: string;
  telefono: string;
  activo: boolean;
}

export interface ProductoForm {
  localId: number;
  categoriaId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  activo: boolean;
}

export interface VentaLocal {
  localId: number;
  localNombre: string;
  cantidadPedidos: number;
  montoVendido: number;
}
