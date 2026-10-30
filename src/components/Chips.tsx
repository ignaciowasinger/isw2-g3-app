import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

export interface OpcionChip<T> {
  valor: T;
  etiqueta: string;
}

interface Props<T> {
  opciones: OpcionChip<T>[];
  seleccionado: T;
  onSeleccionar: (valor: T) => void;
}

/** Selector horizontal genérico: categorías, filtros de estado y opciones de formularios. */
export default function Chips<T extends string | number | null>({
  opciones,
  seleccionado,
  onSeleccionar,
}: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
      contentContainerStyle={styles.fila}
    >
      {opciones.map((opcion) => {
        const activa = opcion.valor === seleccionado;
        return (
          <Pressable
            key={String(opcion.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: activa }}
            onPress={() => onSeleccionar(opcion.valor)}
            style={[styles.chip, activa && styles.chipActiva]}
          >
            <Text style={[styles.texto, activa && styles.textoActivo]}>{opcion.etiqueta}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: { flexGrow: 0, flexShrink: 0 },
  fila: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  chipActiva: { backgroundColor: colors.primary },
  texto: { color: colors.primary, fontWeight: '600' },
  textoActivo: { color: '#FFFFFF' },
});
