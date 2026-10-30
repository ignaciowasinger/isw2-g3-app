import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/** Recarga una lista al volver de otra pantalla (no en la primera carga). */
export function useRecargarAlVolver(recargar: () => void) {
  const primera = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (primera.current) {
        primera.current = false;
        return;
      }
      recargar();
    }, [recargar]),
  );
}
