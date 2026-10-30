import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { obtenerVentas } from '../../../src/api/admin';
import Boton from '../../../src/components/Boton';
import Campo from '../../../src/components/Campo';
import { Aviso, EstadoVacio } from '../../../src/components/Estados';
import { Fila } from '../../../src/components/Fila';
import { useCargar } from '../../../src/hooks/useCargar';
import { colors, spacing } from '../../../src/theme';
import { formatoIsoFecha, formatoPesos } from '../../../src/utils/formato';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const fechaValida = (texto: string): boolean => {
  if (!FECHA.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00`);
  return !Number.isNaN(fecha.getTime()) && formatoIsoFecha(fecha) === texto;
};

export default function VentasScreen() {
  const hoy = new Date();
  const inicial = {
    desde: formatoIsoFecha(new Date(hoy.getFullYear(), hoy.getMonth(), 1)),
    hasta: formatoIsoFecha(hoy),
  };
  const [desde, setDesde] = useState(inicial.desde);
  const [hasta, setHasta] = useState(inicial.hasta);
  const [rango, setRango] = useState(inicial);
  const [errores, setErrores] = useState<string[]>([]);
  const { data, loading, error } = useCargar(
    () => obtenerVentas(rango.desde, rango.hasta),
    [rango],
  );

  function consultar() {
    const lista: string[] = [];
    if (!fechaValida(desde) || !fechaValida(hasta)) {
      lista.push('Las fechas deben tener el formato AAAA-MM-DD y ser válidas.');
    } else if (desde > hasta) {
      lista.push('La fecha "desde" no puede ser posterior a "hasta".');
    }
    setErrores(lista);
    if (lista.length === 0) setRango({ desde, hasta });
  }

  const totalPedidos = data?.reduce((total, venta) => total + venta.cantidadPedidos, 0) ?? 0;
  const totalVendido = data?.reduce((total, venta) => total + venta.montoVendido, 0) ?? 0;

  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <Campo
        etiqueta="Desde"
        valor={desde}
        onChange={setDesde}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      <Campo
        etiqueta="Hasta"
        valor={hasta}
        onChange={setHasta}
        placeholder="AAAA-MM-DD"
        keyboardType="numbers-and-punctuation"
        maxLength={10}
      />
      <Aviso mensajes={errores} />
      <Boton titulo="Consultar" onPress={consultar} loading={loading} />
      <Text style={styles.nota}>
        Solo cuenta pedidos ENTREGADO, sin el costo de envío.
      </Text>

      {error ? <Aviso mensajes={[error]} /> : null}

      {!error && loading && !data ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : null}

      {!error && data && data.length === 0 ? (
        <EstadoVacio titulo="Sin ventas en este período" />
      ) : null}

      {!error && data && data.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.totalTitulo}>Totales del período</Text>
          <Fila etiqueta="Pedidos entregados" valor={String(totalPedidos)} />
          <Fila etiqueta="Monto vendido" valor={formatoPesos(totalVendido)} destacado />
        </View>
      ) : null}

      {!error && data?.map((venta) => (
        <View key={venta.localId} style={styles.card}>
          <Text style={styles.local}>{venta.localNombre}</Text>
          <Fila etiqueta="Pedidos entregados" valor={String(venta.cantidadPedidos)} />
          <Fila etiqueta="Monto vendido" valor={formatoPesos(venta.montoVendido)} destacado />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  nota: { fontSize: 12, color: colors.muted },
  centro: { minHeight: 96, alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  local: { fontSize: 17, fontWeight: '800', color: colors.text },
  totalTitulo: { fontSize: 13, fontWeight: '700', color: colors.muted, textTransform: 'uppercase' },
});
