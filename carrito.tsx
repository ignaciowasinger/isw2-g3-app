import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerCarta } from '../src/api/catalogo';
import Boton from '../src/components/Boton';
import CarritoItemRow from '../src/components/CarritoItemRow';
import { Aviso, EstadoVacio } from '../src/components/Estados';
import { useCarrito } from '../src/context/CarritoContext';
import { colors, spacing } from '../src/theme';
import { formatoPesos } from '../src/utils/formato';
import { confirmarAccion } from '../src/utils/dialogos';

export default function CarritoScreen() {
  const router = useRouter();
  const carrito = useCarrito();
  const [avisos, setAvisos] = useState<string[]>([]);
  const localId = carrito.localId;
  const sincronizar = carrito.sincronizar;

  // Ajusta cantidades y disponibilidad a lo que informa el backend.
  useEffect(() => {
    if (localId === null) return;
    let activo = true;
    obtenerCarta(localId)
      .then((carta) => {
        if (activo) setAvisos(sincronizar(carta));
      })
      .catch(() => {
        // Sin conexión se sigue con los datos locales; el servidor valida al confirmar.
      });
    return () => {
      activo = false;
    };
  }, [localId, sincronizar]);

  function confirmarVaciar() {
    confirmarAccion('Vaciar carrito', '¿Querés quitar todos los productos?', {
      aceptar: carrito.vaciar,
      destructivo: true,
      textoAceptar: 'Vaciar',
    });
  }

  if (carrito.items.length === 0) {
    return (
      <View style={styles.pantalla}>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          detalle="Elegí un local y agregá productos."
          accion={{ titulo: 'Ver locales', onPress: () => router.replace('/') }}
        />
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <FlatList
        data={carrito.items}
        keyExtractor={(item) => String(item.producto.id)}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          <View style={styles.cabecera}>
            <Text style={styles.local}>Pedido en {carrito.localNombre}</Text>
            <Aviso mensajes={avisos} tipo="info" />
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        renderItem={({ item }) => (
          <CarritoItemRow
            item={item}
            onCambiar={(cantidad) => carrito.cambiarCantidad(item.producto.id, cantidad)}
            onQuitar={() => carrito.quitar(item.producto.id)}
          />
        )}
      />

      <SafeAreaView edges={['bottom']} style={styles.pie}>
        <View style={styles.filaSubtotal}>
          <Text style={styles.subtotalTitulo}>Subtotal estimado</Text>
          <Text style={styles.subtotalValor}>{formatoPesos(carrito.subtotalEstimado)}</Text>
        </View>
        <Text style={styles.nota}>
          El descuento, el envío y el total final los calcula el servidor al confirmar.
        </Text>
        <Boton titulo="Continuar" onPress={() => router.push('/confirmar')} />
        <Boton titulo="Vaciar carrito" variante="peligro" onPress={confirmarVaciar} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  lista: { padding: spacing.lg },
  cabecera: { gap: spacing.md, marginBottom: spacing.md },
  local: { fontSize: 18, fontWeight: '800', color: colors.text },
  separador: { height: spacing.md },
  pie: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  filaSubtotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtotalTitulo: { fontSize: 16, color: colors.muted },
  subtotalValor: { fontSize: 20, fontWeight: '800', color: colors.text },
  nota: { fontSize: 12, color: colors.muted },
});
