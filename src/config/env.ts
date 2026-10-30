// Expo reemplaza process.env.EXPO_PUBLIC_* al compilar.
// Se usa una URL por defecto para poder arrancar sin configurar nada en el emulador Android.

const urlCruda = process.env.EXPO_PUBLIC_API_URL ?? '';

/** URL base del backend, sin barra final. */
export const API_URL = (urlCruda.trim() || 'http://10.0.2.2:8080').replace(/\/+$/, '');

/** Tiempo máximo de espera de cada request. */
export const REQUEST_TIMEOUT_MS = 15000;
