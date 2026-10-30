import { Alert, Platform } from 'react-native';

interface OpcionesConfirmacion {
  aceptar: () => void;
  cancelar?: () => void;
  textoAceptar?: string;
  destructivo?: boolean;
}

/**
 * Confirmación de dos opciones.
 * En Android/iOS usa el diálogo nativo; en la versión web, `window.confirm`
 * (react-native-web no implementa Alert).
 */
export function confirmarAccion(
  titulo: string,
  mensaje: string,
  opciones: OpcionesConfirmacion,
): void {
  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensaje}`)) opciones.aceptar();
    else opciones.cancelar?.();
    return;
  }

  Alert.alert(titulo, mensaje, [
    {
      text: opciones.textoAceptar ?? 'Sí',
      style: opciones.destructivo ? 'destructive' : 'default',
      onPress: opciones.aceptar,
    },
    { text: 'Cancelar', style: 'cancel', onPress: opciones.cancelar },
  ]);
}

/** Aviso de una sola opción, equivalente a Alert.alert con un botón. */
export function avisar(titulo: string, mensaje: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensaje}`);
    return;
  }
  Alert.alert(titulo, mensaje);
}
