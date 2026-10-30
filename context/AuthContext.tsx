import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { iniciarSesion as loginApi } from '../api/auth';
import { configurarAuth } from '../api/http';
import type { Rol } from '../types/api';
import { expiracionMs } from '../utils/jwt';

export interface Sesion {
  token: string;
  nombre: string;
  rol: Rol;
  username: string;
}

interface AuthContextValue {
  sesion: Sesion | null;
  cargando: boolean;
  esAdmin: boolean;
  /** Aviso para mostrar en el login (por ejemplo, sesión expirada). */
  aviso: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const CLAVE = 'sesion_sabores'; // SecureStore solo admite letras, números, ".", "-" y "_"
const MSG_EXPIRADA = 'Tu sesión expiró. Iniciá sesión de nuevo.';
const MAX_TIMEOUT = 2147483647;
const usaSecureStore = Platform.OS !== 'web';

const AuthContext = createContext<AuthContextValue | null>(null);

function esSesion(valor: unknown): valor is Sesion {
  if (typeof valor !== 'object' || valor === null) return false;
  const sesion = valor as Record<string, unknown>;
  return (
    typeof sesion.token === 'string' &&
    sesion.token.length > 0 &&
    typeof sesion.nombre === 'string' &&
    typeof sesion.username === 'string' &&
    (sesion.rol === 'ADMIN' || sesion.rol === 'OPERADOR')
  );
}

function vigente(sesion: Sesion): boolean {
  const exp = expiracionMs(sesion.token);
  return exp === null || exp > Date.now();
}

async function leerGuardada(): Promise<Sesion | null> {
  if (!usaSecureStore) return null;
  try {
    const crudo = await SecureStore.getItemAsync(CLAVE);
    if (!crudo) return null;
    const parseada: unknown = JSON.parse(crudo);
    return esSesion(parseada) ? parseada : null;
  } catch {
    return null;
  }
}

async function guardarSesion(sesion: Sesion): Promise<void> {
  if (!usaSecureStore) return;
  try {
    await SecureStore.setItemAsync(CLAVE, JSON.stringify(sesion));
  } catch {
    // Si falla el almacenamiento seguro, la sesión sigue en memoria.
  }
}

async function borrarSesion(): Promise<void> {
  if (!usaSecureStore) return;
  try {
    await SecureStore.deleteItemAsync(CLAVE);
  } catch {
    // Nada que limpiar.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);
  const ref = useRef<Sesion | null>(null);
  ref.current = sesion;

  const cerrar = useCallback(async (motivo: string | null = null) => {
    ref.current = null;
    setSesion(null);
    setAviso(motivo);
    await borrarSesion();
  }, []);

  // El cliente HTTP toma el token de acá y avisa si el backend responde 401.
  useEffect(() => {
    configurarAuth(
      () => ref.current?.token ?? null,
      () => {
        if (ref.current) void cerrar(MSG_EXPIRADA);
      },
    );
  }, [cerrar]);

  // Restaura la sesión guardada, si sigue vigente.
  useEffect(() => {
    let activo = true;
    (async () => {
      const guardada = await leerGuardada();
      if (!activo) return;
      if (guardada && vigente(guardada)) {
        ref.current = guardada;
        setSesion(guardada);
      } else if (guardada) {
        await borrarSesion();
        if (activo) setAviso(MSG_EXPIRADA);
      }
      if (activo) setCargando(false);
    })();
    return () => {
      activo = false;
    };
  }, []);

  // Cierra la sesión sola cuando vence el token (8 horas por configuración del backend).
  useEffect(() => {
    if (!sesion) return;
    const exp = expiracionMs(sesion.token);
    if (exp === null) return;
    const restante = exp - Date.now();
    if (restante <= 0) {
      void cerrar(MSG_EXPIRADA);
      return;
    }
    const temporizador = setTimeout(
      () => void cerrar(MSG_EXPIRADA),
      Math.min(restante, MAX_TIMEOUT),
    );
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active' && Date.now() >= exp) void cerrar(MSG_EXPIRADA);
    });
    return () => {
      clearTimeout(temporizador);
      suscripcion.remove();
    };
  }, [sesion, cerrar]);

  const login = useCallback(async (username: string, password: string) => {
    const respuesta = await loginApi(username.trim(), password);
    const nueva: Sesion = {
      token: respuesta.token,
      nombre: respuesta.nombre || respuesta.nombreCompleto,
      rol: respuesta.rol,
      username: username.trim(),
    };
    await guardarSesion(nueva);
    ref.current = nueva;
    setSesion(nueva);
    setAviso(null);
  }, []);

  const logout = useCallback(() => cerrar(null), [cerrar]);

  const valor = useMemo<AuthContextValue>(
    () => ({
      sesion,
      cargando,
      esAdmin: sesion?.rol === 'ADMIN',
      aviso,
      login,
      logout,
    }),
    [sesion, cargando, aviso, login, logout],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
