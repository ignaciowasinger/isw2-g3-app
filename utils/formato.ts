/** Importes en formato argentino: $ 1.234,56. */
export function formatoPesos(valor: number): string {
  if (!Number.isFinite(valor)) return '$ 0,00';
  const [entero, decimales] = valor.toFixed(2).split('.');
  return `$ ${entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimales}`;
}

/** Fecha y hora local: DD/MM/AAAA HH:mm. */
export function formatoFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${dos(fecha.getDate())}/${dos(fecha.getMonth() + 1)}/${fecha.getFullYear()} ${dos(
    fecha.getHours(),
  )}:${dos(fecha.getMinutes())}`;
}

/** Fecha local en formato AAAA-MM-DD (para filtros de la API). */
export function formatoIsoFecha(fecha: Date): string {
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}
