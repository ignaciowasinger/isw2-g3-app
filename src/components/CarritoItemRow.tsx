import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ItemCarrito } from '../context/CarritoContext';
import { colors, spacing } from '../theme';
import { formatoPesos } from '../utils/formato';
import CantidadStepper from './CantidadStepper';

interface Props {
  item: ItemCarrito;
  onCambiar: (cantidad: number) => void;
  onQuitar: () => void;
}

export default function CarritoItemRow({ item, onCambiar, onQuitar }: Props) {
  const { producto, cantidad } = item;
  const importe = (Math.round(producto.precio * 100) * cantidad) / 100;
  return (
    <View style={styles.card}>
      <View style={styles.cabecera}>
        <View style={styles.info}>
          <Text style={styles.nombre}>{producto.nombre}</Text>
          <Text style={styles.detalle}>
            {formatoPesos(producto.precio)} c/u · máx. {producto.stock}
          </Text>
        </View>
        <Pressable onPress={onQuitar} hitSlop={8} accessibilityRole="button">
          <Text style={styles.quitar}>Eliminar</Text>
        </Pressable>
      </View>
      <View style={styles.pie}>
        <CantidadStepper valor={cantidad} max={producto.stock} onChange={onCambiar} />
        <Text style={styles.importe}>{formatoPesos(importe)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cabecera: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  info: { flex: 1 },
  nombre: { fontSize: 16, fontWeight: '700', color: colors.text },
  detalle: { fontSize: 13, color: colors.muted, marginTop: 2 },
  quitar: { color: colors.danger, fontWeight: '600' },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  importe: { fontSize: 17, fontWeight: '700', color: colors.text },
});
