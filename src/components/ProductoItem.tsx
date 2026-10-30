import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import type { Producto } from '../types/api';
import { formatoPesos } from '../utils/formato';
import Boton from './Boton';
import CantidadStepper from './CantidadStepper';

interface Props {
  producto: Producto;
  cantidadEnCarrito: number;
  onAgregar: () => void;
  onCambiarCantidad: (cantidad: number) => void;
}

export default function ProductoItem({
  producto,
  cantidadEnCarrito,
  onAgregar,
  onCambiarCantidad,
}: Props) {
  const disponible = producto.disponible && producto.stock > 0;
  return (
    <View style={[styles.card, !disponible && styles.noDisponible]}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        {producto.descripcion ? (
          <Text style={styles.descripcion}>{producto.descripcion}</Text>
        ) : null}
        <Text style={styles.precio}>{formatoPesos(producto.precio)}</Text>
        {disponible ? (
          <Text style={styles.stock}>Stock: {producto.stock}</Text>
        ) : (
          <Text style={styles.agotado}>Sin stock</Text>
        )}
      </View>
      <View style={styles.accion}>
        {!disponible ? null : cantidadEnCarrito > 0 ? (
          <CantidadStepper
            valor={cantidadEnCarrito}
            max={producto.stock}
            onChange={onCambiarCantidad}
          />
        ) : (
          <Boton titulo="Agregar" onPress={onAgregar} />
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  noDisponible: { opacity: 0.7 },
  info: { flex: 1, gap: 2 },
  nombre: { fontSize: 16, fontWeight: '700', color: colors.text },
  descripcion: { fontSize: 14, color: colors.muted },
  precio: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  stock: { fontSize: 13, color: colors.ok },
  agotado: { fontSize: 13, color: colors.danger, fontWeight: '700' },
  accion: { alignItems: 'flex-end' },
});
