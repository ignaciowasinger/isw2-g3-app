import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { obtenerCarta } from '../../src/api/catalogo';
import BarraCarrito from '../../src/components/BarraCarrito';
import CategoriaChips from '../../src/components/CategoriaChips';
import { Cargando, ErrorReintentar, EstadoVacio } from '../../src/components/Estados';
import ProductoItem from '../../src/components/ProductoItem';
import { useCarrito } from '../../src/context/CarritoContext';
import { useCargar } from '../../src/hooks/useCargar';
import { colors, spacing } from '../../src/theme';
import type { Producto } from '../../src/types/api';
import { confirmarAccion, avisar } from '../../src/utils/dialogos';

export default function CartaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const localId = Number(id);
  const router = useRouter();
  const carrito = useCarrito();
  const [categoria, setCategoria] = useState<number | null>(null);
  const { data: carta, loading, error, recargar } = useCargar(
    () => obtenerCarta(localId),
    [localId],
  );

  const secciones = useMemo(() => {
    if (!carta) return [];
    return carta.categorias
      .filter((c) => categoria === null || c.id === categoria)
      .filter((c) => c.productos.length > 0)
      .map((c) => ({ title: c.nombre, data: c.productos }));
  }, [carta, categoria]);

  const hayDisponibles = useMemo(
    () =>
      !!carta &&
      carta.categorias.some((categoriaCarta) =>
        categoriaCarta.productos.some((producto) => producto.disponible && producto.stock > 0),
      ),
    [carta],
  );

  function agregar(producto: Producto) {
    const resultado = carrito.agregar(producto);
    if (resultado === 'sin_stock') {
      avisar('Sin stock', 'No hay más unidades disponibles de este producto.');
    } else if (resultado === 'otro_local') {
      confirmarAccion(
        'Carrito de otro local',
        `Tu carrito tiene productos de ${carrito.localNombre}. Un pedido solo puede ser de un local. ¿Vaciarlo y empezar un pedido en ${producto.localNombre}?`,
        {
          aceptar: () => carrito.reemplazarPor(producto),
          destructivo: true,
          textoAceptar: 'Vaciar y agregar',
        },
      );
    }
  }

  if (loading && !carta) return <Cargando texto="Cargando carta..." />;
  if (error && !carta) return <ErrorReintentar mensaje={error} onReintentar={recargar} />;
  if (!carta) return null;

  return (
    <View style={styles.pantalla}>
      <Stack.Screen options={{ title: carta.localNombre }} />

      {carta.categorias.length > 0 ? (
        <CategoriaChips
          categorias={carta.categorias.map((c) => ({ id: c.id, nombre: c.nombre }))}
          seleccionada={categoria}
          onSeleccionar={setCategoria}
        />
      ) : null}

      {!hayDisponibles && carta.categorias.length > 0 ? (
        <Text style={styles.aviso}>Por ahora no hay productos con stock en este local.</Text>
      ) : null}

      <SectionList
        sections={secciones}
        keyExtractor={(producto) => String(producto.id)}
        contentContainerStyle={styles.lista}
        stickySectionHeadersEnabled={false}
        onRefresh={recargar}
        refreshing={loading}
        renderSectionHeader={({ section }) => (
          <Text style={styles.seccion}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <ProductoItem
              producto={item}
              cantidadEnCarrito={carrito.cantidadDe(item.id)}
              onAgregar={() => agregar(item)}
              onCambiarCantidad={(cantidad) => carrito.cambiarCantidad(item.id, cantidad)}
            />
          </View>
        )}
        ListEmptyComponent={
          <EstadoVacio
            titulo="Este local todavía no tiene productos"
            detalle="Probá con otro local o volvé más tarde."
          />
        }
      />

      <BarraCarrito
        cantidad={carrito.cantidadTotal}
        subtotal={carrito.subtotalEstimado}
        onPress={() => router.push('/carrito')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  lista: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1 },
  seccion: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  item: { marginBottom: spacing.md },
  aviso: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.warnBg,
    color: colors.warnText,
  },
});
