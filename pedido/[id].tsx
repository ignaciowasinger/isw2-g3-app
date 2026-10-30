import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ApiError } from '../../../src/api/http';
import {
  avanzarPedido,
  cancelarPedido,
  obtenerEnCalle,
  obtenerPedido,
} from '../../../src/api/operaciones';
import Boton from '../../../src/components/Boton';
import EstadoBadge from '../../../src/components/EstadoBadge';
import { Aviso, Cargando, ErrorReintentar } from '../../../src/components/Estados';
import { Fila } from '../../../src/components/Fila';
import ResumenMontos from '../../../src/components/ResumenMontos';
import { useCargar } from '../../../src/hooks/useCargar';
import { colors, spacing } from '../../../src/theme';
import type {
  EstadoPedido,
  PedidoDetalle,
  RepartidorEnCalle,
} from '../../../src/types/api';
import { formatoFecha } from '../../../src/utils/formato';
import { confirmarAccion } from '../../../src/utils/dialogos';

const MAX_EN_CAMINO = 3; // RN-03: el servidor valida igual.

const ACCION_AVANCE: Partial<Record<EstadoPedido, string>> = {
  RECIBIDO: 'Pasar a preparación',
  EN_PREPARACION: 'Despachar con repartidor',
  EN_CAMINO: 'Marcar como entregado',
};

export default function PedidoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pedidoId = Number(id);
  const { data, loading, error, recargar } = useCargar(
    () => obtenerPedido(pedidoId),
    [pedidoId],
  );
  const [actualizado, setActualizado] = useState<PedidoDetalle | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [trabajando, setTrabajando] = useState(false);
  const [repartidores, setRepartidores] = useState<RepartidorEnCalle[] | null>(null);

  const pedido = actualizado ?? data;

  if (loading && !pedido) return <Cargando />;
  if (error && !pedido) return <ErrorReintentar mensaje={error} onReintentar={recargar} />;
  if (!pedido) return null;

  const puedeCancelar = pedido.estado === 'RECIBIDO' || pedido.estado === 'EN_PREPARACION';
  const accionAvance = ACCION_AVANCE[pedido.estado];

  async function ejecutar(accion: () => Promise<PedidoDetalle>) {
    setTrabajando(true);
    setErrores([]);
    try {
      setActualizado(await accion());
      setRepartidores(null);
    } catch (e) {
      setErrores([e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.']);
      // El estado pudo haber cambiado desde otro dispositivo: se refresca.
      setActualizado(null);
      await recargar();
    } finally {
      setTrabajando(false);
    }
  }

  function confirmar(
    titulo: string,
    accion: () => Promise<PedidoDetalle>,
    destructivo = false,
  ) {
    confirmarAccion(titulo, '¿Confirmás la acción?', {
      aceptar: () => void ejecutar(accion),
      destructivo,
    });
  }

  async function avanzar() {
    if (pedido?.estado === 'EN_PREPARACION') {
      setErrores([]);
      try {
        setRepartidores(await obtenerEnCalle());
      } catch (e) {
        setErrores([e instanceof ApiError ? e.message : 'No se pudieron cargar los repartidores.']);
      }
      return;
    }
    if (accionAvance) confirmar(accionAvance, () => avanzarPedido(pedidoId));
  }

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <View style={styles.card}>
        <View style={styles.cabecera}>
          <Text style={styles.codigo}>{pedido.codigoSeguimiento}</Text>
          <EstadoBadge estado={pedido.estado} />
        </View>
        <Fila etiqueta="Local" valor={pedido.localNombre} />
        <Fila etiqueta="Fecha" valor={formatoFecha(pedido.fechaHora)} />
        {pedido.repartidorNombre ? (
          <Fila etiqueta="Repartidor" valor={pedido.repartidorNombre} />
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.titulo}>Cliente</Text>
        <Fila etiqueta="Nombre" valor={pedido.clienteNombre} />
        <Fila etiqueta="Teléfono" valor={pedido.clienteTelefono} />
        <Fila etiqueta="Dirección" valor={pedido.direccionEntrega} />
      </View>

      <ResumenMontos
        items={pedido.items}
        subtotal={pedido.subtotal}
        descuento={pedido.descuento}
        costoEnvio={pedido.costoEnvio}
        total={pedido.total}
      />

      <Aviso mensajes={errores} />

      {repartidores ? (
        <View style={styles.card}>
          <Text style={styles.titulo}>Elegí el repartidor</Text>
          {repartidores.length === 0 ? (
            <Text style={styles.sub}>No hay repartidores activos.</Text>
          ) : null}
          {repartidores.map((repartidor) => {
            const lleno = repartidor.cantidadEnCamino >= MAX_EN_CAMINO;
            return (
              <Pressable
                key={repartidor.repartidorId}
                accessibilityRole="button"
                disabled={lleno || trabajando}
                style={[styles.repartidor, lleno && styles.repartidorLleno]}
                onPress={() =>
                  confirmar(`Despachar con ${repartidor.nombreCompleto}`, () =>
                    avanzarPedido(pedidoId, repartidor.repartidorId),
                  )
                }
              >
                <Text style={styles.repartidorNombre}>{repartidor.nombreCompleto}</Text>
                <Text style={styles.sub}>
                  {lleno
                    ? 'Completo'
                    : `${repartidor.cantidadEnCamino} de ${MAX_EN_CAMINO} en camino`}
                </Text>
              </Pressable>
            );
          })}
          <Boton titulo="Cerrar" variante="secundario" onPress={() => setRepartidores(null)} />
        </View>
      ) : null}

      {accionAvance && !repartidores ? (
        <Boton titulo={accionAvance} onPress={avanzar} loading={trabajando} />
      ) : null}

      {puedeCancelar ? (
        <Boton
          titulo="Cancelar pedido"
          variante="peligro"
          disabled={trabajando}
          onPress={() =>
            confirmar('Cancelar pedido', () => cancelarPedido(pedidoId), true)
          }
        />
      ) : null}

      {!accionAvance ? (
        <Text style={styles.sub}>Este pedido está finalizado y no admite cambios.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  codigo: { fontSize: 22, fontWeight: '800', letterSpacing: 2, color: colors.primary },
  titulo: { fontSize: 16, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.muted },
  repartidor: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  repartidorLleno: { opacity: 0.45 },
  repartidorNombre: { fontSize: 16, fontWeight: '700', color: colors.text },
});
