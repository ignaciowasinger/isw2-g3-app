import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Boton from '../src/components/Boton';
import { EstadoVacio } from '../src/components/Estados';
import { Fila } from '../src/components/Fila';
import ResumenMontos from '../src/components/ResumenMontos';
import { useCarrito } from '../src/context/CarritoContext';
import { colors, spacing } from '../src/theme';
import { formatoFecha } from '../src/utils/formato';
import { etiquetaEstado } from '../src/components/EstadoBadge';

export default function ResultadoScreen() {
  const router = useRouter();
  const { pedidoCreado, setPedidoCreado } = useCarrito();

  function volver() {
    setPedidoCreado(null);
    router.replace('/');
  }

  if (!pedidoCreado) {
    return (
      <View style={styles.pantalla}>
        <EstadoVacio
          titulo="No hay un pedido para mostrar"
          accion={{ titulo: 'Ir al inicio', onPress: volver }}
        />
      </View>
    );
  }

  const pedido = pedidoCreado;
  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <View style={styles.codigoCaja}>
        <Text style={styles.ok}>¡Pedido recibido!</Text>
        <Text style={styles.codigoEtiqueta}>Tu código de seguimiento</Text>
        <Text selectable style={styles.codigo}>
          {pedido.codigoSeguimiento}
        </Text>
        <Text style={styles.nota}>
          Guardalo: lo necesitás para consultar el estado de tu pedido.
        </Text>
      </View>

      <View style={styles.card}>
        <Fila etiqueta="Local" valor={pedido.localNombre} />
        <Fila etiqueta="Estado" valor={etiquetaEstado(pedido.estado)} />
        <Fila etiqueta="Fecha" valor={formatoFecha(pedido.fechaHora)} />
      </View>

      <ResumenMontos
        items={pedido.items}
        subtotal={pedido.subtotal}
        descuento={pedido.descuento}
        costoEnvio={pedido.costoEnvio}
        total={pedido.total}
      />

      <Boton
        titulo="Seguir este pedido"
        variante="secundario"
        onPress={() =>
          router.replace({
            pathname: '/seguimiento',
            params: { codigo: pedido.codigoSeguimiento },
          })
        }
      />
      <Boton titulo="Volver al inicio" onPress={volver} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  codigoCaja: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ok: { fontSize: 20, fontWeight: '800', color: colors.ok },
  codigoEtiqueta: { color: colors.muted, fontSize: 14 },
  codigo: { fontSize: 34, fontWeight: '800', letterSpacing: 4, color: colors.primary },
  nota: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
