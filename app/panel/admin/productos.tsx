import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { listarProductosAdmin } from '../../../src/api/admin';
import Boton from '../../../src/components/Boton';
import { Cargando, ErrorReintentar, EstadoVacio } from '../../../src/components/Estados';
import FilaAdmin from '../../../src/components/FilaAdmin';
import { useCargar } from '../../../src/hooks/useCargar';
import { useRecargarAlVolver } from '../../../src/hooks/useRecargarAlVolver';
import { colors, spacing } from '../../../src/theme';
import { formatoPesos } from '../../../src/utils/formato';

export default function ProductosAdminScreen() {
  const router = useRouter();
  const { data, loading, error, recargar } = useCargar(listarProductosAdmin);
  useRecargarAlVolver(recargar);

  if (loading && !data) return <Cargando />;
  if (error && !data) return <ErrorReintentar mensaje={error} onReintentar={recargar} />;

  return (
    <FlatList
      style={styles.pantalla}
      data={data ?? []}
      keyExtractor={(producto) => String(producto.id)}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={recargar} colors={[colors.primary]} />
      }
      ListHeaderComponent={
        <Boton
          titulo="+ Nuevo producto"
          onPress={() => router.push('/panel/admin/producto-form')}
        />
      }
      ItemSeparatorComponent={() => <View style={styles.separador} />}
      renderItem={({ item }) => (
        <FilaAdmin
          titulo={item.nombre}
          subtitulo={`${item.localNombre} · ${item.categoriaNombre}`}
          detalle={`${formatoPesos(item.precio)} · stock ${item.stock}`}
          activo={item.activo}
          onPress={() =>
            router.push({
              pathname: '/panel/admin/producto-form',
              params: { id: String(item.id) },
            })
          }
        />
      )}
      ListEmptyComponent={
        <EstadoVacio titulo="No hay productos" detalle="Creá un local y cargá su carta." />
      }
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  lista: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  separador: { height: spacing.md },
});
