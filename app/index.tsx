import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { obtenerLocales } from '../src/api/catalogo';
import BarraCarrito from '../src/components/BarraCarrito';
import Boton from '../src/components/Boton';
import { Cargando, ErrorReintentar, EstadoVacio } from '../src/components/Estados';
import LocalCard from '../src/components/LocalCard';
import { useAuth } from '../src/context/AuthContext';
import { useCarrito } from '../src/context/CarritoContext';
import { useCargar } from '../src/hooks/useCargar';
import { colors, spacing } from '../src/theme';

export default function LocalesScreen() {
  const router = useRouter();
  const { sesion } = useAuth();
  const { cantidadTotal, subtotalEstimado } = useCarrito();
  const { data, loading, error, recargar } = useCargar(obtenerLocales);

  return (
    <View style={styles.pantalla}>
      <View style={styles.accesos}>
        <Boton
          titulo="Seguir mi pedido"
          variante="secundario"
          onPress={() => router.push('/seguimiento')}
        />
        <Boton
          titulo={sesion ? `Panel del personal (${sesion.nombre})` : 'Acceso del personal'}
          variante="secundario"
          onPress={() => router.push(sesion ? '/panel' : '/login')}
        />
      </View>

      {loading && !data ? (
        <Cargando texto="Cargando locales..." />
      ) : error && !data ? (
        <ErrorReintentar mensaje={error} onReintentar={recargar} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(local) => String(local.id)}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={recargar} colors={[colors.primary]} />
          }
          ListHeaderComponent={<Text style={styles.titulo}>Elegí un local</Text>}
          renderItem={({ item }) => (
            <LocalCard
              local={item}
              onPress={() =>
                router.push({ pathname: '/local/[id]', params: { id: String(item.id) } })
              }
            />
          )}
          ListEmptyComponent={
            <EstadoVacio
              titulo="No hay locales disponibles"
              detalle="Volvé a intentar más tarde."
            />
          }
        />
      )}

      <BarraCarrito
        cantidad={cantidadTotal}
        subtotal={subtotalEstimado}
        onPress={() => router.push('/carrito')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  accesos: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },
  lista: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  titulo: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
});
