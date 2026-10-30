import { API_URL, REQUEST_TIMEOUT_MS } from '../config/env';
import type { ApiErrorBody } from '../types/api';

export type ApiErrorKind = 'config' | 'network' | 'timeout' | 'http';

/**
 * Error único de la capa de red.
 * - 'http': el servidor respondió con error (status y mensaje del backend).
 * - 'network' / 'timeout': no hubo respuesta.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly detalles: string[];

  constructor(kind: ApiErrorKind, message: string, status = 0, detalles: string[] = []) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.detalles = detalles;
  }
}

/** Mensaje apto para mostrar al usuario a partir de cualquier error. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}

export function detallesDeError(error: unknown): string[] {
  return error instanceof ApiError ? error.detalles : [];
}

// ---- Sesión ----
// AuthProvider configura de dónde sale el token y qué hacer cuando el backend responde 401.
let obtenerToken: () => string | null = () => null;
let alNoAutorizado: () => void = () => {};

export function configurarAuth(getToken: () => string | null, onNoAutorizado: () => void): void {
  obtenerToken = getToken;
  alNoAutorizado = onNoAutorizado;
}

// ---- Cliente ----
type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Opciones {
  /** Envía el JWT. Solo para endpoints del personal. */
  auth?: boolean;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const MENSAJES_POR_ESTADO: Record<number, string> = {
  400: 'Los datos enviados no son válidos.',
  401: 'Tu sesión no es válida o venció. Ingresá de nuevo.',
  403: 'No tenés permisos para realizar esta acción.',
  404: 'No se encontró lo que buscabas.',
  409: 'La operación entra en conflicto con los datos actuales.',
  422: 'La operación no está permitida.',
};

function armarUrl(ruta: string): string {
  return `${API_URL}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}

function extraerDetalles(datos: unknown): string[] {
  if (typeof datos !== 'object' || datos === null) return [];
  const cuerpo = datos as Partial<ApiErrorBody> & { errors?: unknown; fieldErrors?: unknown };
  const fuente = cuerpo.detalles ?? cuerpo.errors ?? cuerpo.fieldErrors;
  if (!fuente) return [];
  const lista: unknown[] = Array.isArray(fuente) ? fuente : Object.values(fuente);
  return lista
    .map((item) => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        const registro = item as { message?: unknown; defaultMessage?: unknown };
        if (typeof registro.message === 'string') return registro.message;
        if (typeof registro.defaultMessage === 'string') return registro.defaultMessage;
      }
      return '';
    })
    .filter((mensaje): mensaje is string => mensaje.length > 0);
}

function errorDeRespuesta(status: number, datos: unknown): ApiError {
  const cuerpo =
    typeof datos === 'object' && datos !== null ? (datos as Partial<ApiErrorBody>) : {};
  const mensaje =
    status === 403
      ? 'No tenés permiso para realizar esta acción.'
      : typeof cuerpo.message === 'string' && cuerpo.message.length > 0
        ? cuerpo.message
        : (MENSAJES_POR_ESTADO[status] ??
          (status >= 500
            ? 'Error en el servidor. Intentá de nuevo más tarde.'
            : 'No se pudo completar la solicitud.'));

  return new ApiError('http', mensaje, status, extraerDetalles(datos));
}

async function request<T>(metodo: Metodo, ruta: string, opciones: Opciones = {}): Promise<T> {
  const { auth = false, body, headers: cabecerasExtra, signal } = opciones;
  const token = auth ? obtenerToken() : null;

  if (auth && !token) {
    alNoAutorizado();
    throw new ApiError('http', MENSAJES_POR_ESTADO[401], 401);
  }

  if (!API_URL) {
    throw new ApiError(
      'config',
      'Falta configurar EXPO_PUBLIC_API_URL en el archivo .env. Reiniciá Expo con "npx expo start -c".',
    );
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  Object.assign(headers, cabecerasExtra);

  // Timeout propio + cancelación externa opcional.
  const controlador = new AbortController();
  let vencio = false;
  const temporizador = setTimeout(() => {
    vencio = true;
    controlador.abort();
  }, REQUEST_TIMEOUT_MS);
  const cancelarPorFuera = () => controlador.abort();
  signal?.addEventListener('abort', cancelarPorFuera);

  let respuesta: Response;
  try {
    respuesta = await fetch(armarUrl(ruta), {
      method: metodo,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controlador.signal,
    });
  } catch (error) {
    if (vencio) {
      throw new ApiError('timeout', 'El servidor tardó demasiado en responder. Intentá de nuevo.');
    }
    if (signal?.aborted) throw error;
    throw new ApiError(
      'network',
      'No se pudo conectar con el servidor. Revisá tu conexión y la dirección de la API.',
    );
  } finally {
    clearTimeout(temporizador);
    signal?.removeEventListener('abort', cancelarPorFuera);
  }

  if (respuesta.status === 204) return undefined as T;

  const texto = await respuesta.text();
  let datos: unknown;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = undefined;
    }
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && auth) alNoAutorizado();
    throw errorDeRespuesta(respuesta.status, datos);
  }

  if (texto && datos === undefined) {
    throw new ApiError('http', 'La respuesta del servidor no tiene un formato válido.', respuesta.status);
  }

  return datos as T;
}

export const api = {
  get: <T>(ruta: string, opciones?: Omit<Opciones, 'body'>) => request<T>('GET', ruta, opciones),
  post: <T>(ruta: string, body?: unknown, opciones?: Omit<Opciones, 'body'>) =>
    request<T>('POST', ruta, { ...opciones, body }),
  put: <T>(ruta: string, body?: unknown, opciones?: Omit<Opciones, 'body'>) =>
    request<T>('PUT', ruta, { ...opciones, body }),
  patch: <T>(ruta: string, body?: unknown, opciones?: Omit<Opciones, 'body'>) =>
    request<T>('PATCH', ruta, { ...opciones, body }),
  delete: <T>(ruta: string, opciones?: Omit<Opciones, 'body'>) =>
    request<T>('DELETE', ruta, opciones),
};
