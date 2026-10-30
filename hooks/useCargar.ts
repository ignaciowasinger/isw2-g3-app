import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../api/http';

/**
 * Carga asíncrona con estados de carga y error.
 * `deps` debe incluir todo lo que use `funcion` (por ejemplo, un id o un filtro).
 */
export function useCargar<T>(funcion: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await funcion());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { data, loading, error, recargar };
}
