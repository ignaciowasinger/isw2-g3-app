import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { listarLocalesAdmin } from '../../../src/api/admin';
import Boton from '../../../src/components/Boton';
import { Cargando, ErrorReintentar, EstadoVacio } from '../../../src/components/Estados';
import FilaAdmin from '../../../src/components/FilaAdmin';
import { useCargar } from '../../../src/hooks/useCargar';
import { useRecargarAlVolver } from '../../../src/hooks/useRecargarAlVolver';
import { colors, spacing } from '../../../src/theme';

export default function LocalesAdminScreen() {
  const router = useRouter();
  const { data, loading, error, recargar } = useCargar(listarLocalesAdmin);
  useRecargarAlVolver(recargar);

  if (loading && !data) return <Cargando />;
  if (error && !data) return <ErrorReintentar mensaje={error} onReintentar={recargar} />;

  return (
    <FlatList
      style={styles.pantalla}
      data={data ?? []}
      keyExtractor={(local) => String(local.id)}
      contentContainerStyle={styles.lista}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={recargar} colors={[colors.primary]} />
      }
      ListHeaderComponent={
        <Boton titulo="+ Nuevo local" onPress={() => router.push('/panel/admin/local-form')} />
      }
      ItemSeparatorComponent={() => <View style={styles.separador} />}
      renderItem={({ item }) => (
        <FilaAdmin
          titulo={item.nombre}
          subtitulo={item.direccion ?? undefined}
          detalle={item.telefono ? `Tel. ${item.telefono}` : undefined}
          activo={item.activo}
          onPress={() =>
            router.push({
              pathname: '/panel/admin/local-form',
              params: { id: String(item.id) },
            })
          }
        />
      )}
      ListEmptyComponent={
        <EstadoVacio titulo="No hay locales" detalle="Cargá el primero para poder recibir pedidos." />
      }
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  lista: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  separador: { height: spacing.md },
});
