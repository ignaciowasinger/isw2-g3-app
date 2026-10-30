import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { listarPedidos } from '../../src/api/operaciones';
import Chips, { type OpcionChip } from '../../src/components/Chips';
import EstadoBadge from '../../src/components/EstadoBadge';
import { Cargando, ErrorReintentar, EstadoVacio } from '../../src/components/Estados';
import { useCargar } from '../../src/hooks/useCargar';
import { useRecargarAlVolver } from '../../src/hooks/useRecargarAlVolver';
import { colors, spacing } from '../../src/theme';
import type { EstadoPedido } from '../../src/types/api';
import { formatoFecha, formatoPesos } from '../../src/utils/formato';

const FILTROS: OpcionChip<EstadoPedido | null>[] = [
  { valor: null, etiqueta: 'En curso' },
  { valor: 'RECIBIDO', etiqueta: 'Recibidos' },
  { valor: 'EN_PREPARACION', etiqueta: 'En preparación' },
  { valor: 'EN_CAMINO', etiqueta: 'En camino' },
  { valor: 'ENTREGADO', etiqueta: 'Entregados' },
  { valor: 'CANCELADO', etiqueta: 'Cancelados' },
];

export default function PedidosScreen() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoPedido | null>(null);
  const { data, loading, error, recargar } = useCargar(() => listarPedidos(estado), [estado]);
  useRecargarAlVolver(recargar);

  return (
    <View style={styles.pantalla}>
      <Chips<EstadoPedido | null>
        opciones={FILTROS}
        seleccionado={estado}
        onSeleccionar={setEstado}
      />

      {loading && !data ? (
        <Cargando />
      ) : error && !data ? (
        <ErrorReintentar mensaje={error} onReintentar={recargar} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(pedido) => String(pedido.id)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={recargar} colors={[colors.primary]} />
          }
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.card, pressed && styles.presionado]}
              onPress={() =>
                router.push({ pathname: '/panel/pedido/[id]', params: { id: String(item.id) } })
              }
            >
              <View style={styles.cabecera}>
                <Text style={styles.codigo}>{item.codigoSeguimiento}</Text>
                <EstadoBadge estado={item.estado} />
              </View>
              <Text style={styles.texto}>
                {item.localNombre} · {item.clienteNombre}
              </Text>
              {item.repartidorNombre ? (
                <Text style={styles.sub}>Repartidor: {item.repartidorNombre}</Text>
              ) : null}
              <View style={styles.cabecera}>
                <Text style={styles.sub}>{formatoFecha(item.fechaHora)}</Text>
                <Text style={styles.total}>{formatoPesos(item.total)}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <EstadoVacio titulo="No hay pedidos" detalle="No hay pedidos con este filtro." />
          }
        />
      )}
    </View>
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
    gap: 4,
  },
  presionado: { opacity: 0.85 },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codigo: { fontSize: 17, fontWeight: '800', letterSpacing: 1, color: colors.primary },
  texto: { fontSize: 15, color: colors.text },
  sub: { fontSize: 13, color: colors.muted },
  total: { fontSize: 16, fontWeight: '800', color: colors.text },
});
