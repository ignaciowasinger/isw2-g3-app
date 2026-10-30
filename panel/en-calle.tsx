import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { obtenerEnCalle } from '../../src/api/operaciones';
import { Cargando, ErrorReintentar, EstadoVacio } from '../../src/components/Estados';
import { useCargar } from '../../src/hooks/useCargar';
import { useRecargarAlVolver } from '../../src/hooks/useRecargarAlVolver';
import { colors, spacing } from '../../src/theme';

export default function EnCalleScreen() {
  const { data, loading, error, recargar } = useCargar(obtenerEnCalle);
  useRecargarAlVolver(recargar);

  if (loading && !data) return <Cargando />;
  if (error && !data) return <ErrorReintentar mensaje={error} onReintentar={recargar} />;

  return (
    <FlatList
      style={styles.pantalla}
      data={data ?? []}
      keyExtractor={(repartidor) => String(repartidor.repartidorId)}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={recargar} colors={[colors.primary]} />
      }
      ItemSeparatorComponent={() => <View style={styles.separador} />}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cabecera}>
            <Text style={styles.nombre}>{item.nombreCompleto}</Text>
            <Text style={styles.cantidad}>{item.cantidadEnCamino} en camino</Text>
          </View>
          <Text style={styles.codigos}>
            {item.codigosPedidos.length > 0
              ? item.codigosPedidos.join('  ·  ')
              : 'Sin pedidos en la calle'}
          </Text>
        </View>
      )}
      ListEmptyComponent={<EstadoVacio titulo="No hay repartidores activos" />}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  lista: { padding: spacing.lg, flexGrow: 1 },
  separador: { height: spacing.md },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between' },
  nombre: { fontSize: 16, fontWeight: '700', color: colors.text },
  cantidad: { fontSize: 14, fontWeight: '700', color: colors.primary },
  codigos: { fontSize: 14, color: colors.muted, letterSpacing: 1 },
});
