import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { PedidoItem } from '../types/api';
import { formatoPesos } from '../utils/formato';
import { Fila, Separador } from './Fila';

interface Props {
  items: PedidoItem[];
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
}

/** Ítems y montos tal como los devuelve el servidor. */
export default function ResumenMontos({
  items,
  subtotal,
  descuento,
  costoEnvio,
  total,
}: Props) {
  return (
    <View style={styles.card}>
      {items.map((item, indice) => (
        <Fila
          key={`${item.productoNombre}-${indice}`}
          etiqueta={`${item.cantidad} × ${item.productoNombre}`}
          valor={formatoPesos(item.subtotal)}
        />
      ))}
      <Separador />
      <Fila etiqueta="Subtotal" valor={formatoPesos(subtotal)} />
      {descuento > 0 ? (
        <Fila etiqueta="Descuento" valor={`- ${formatoPesos(descuento)}`} />
      ) : null}
      <Fila etiqueta="Envío" valor={formatoPesos(costoEnvio)} />
      <Fila etiqueta="Total" valor={formatoPesos(total)} destacado />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
