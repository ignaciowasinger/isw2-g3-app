import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  valor: number;
  max: number;
  onChange: (nuevo: number) => void;
}

export default function CantidadStepper({ valor, max, onChange }: Props) {
  const topeAlcanzado = valor >= max;
  return (
    <View style={styles.fila}>
      <Pressable
        style={styles.boton}
        onPress={() => onChange(valor - 1)}
        accessibilityRole="button"
        accessibilityLabel="Quitar una unidad"
      >
        <Text style={styles.simbolo}>−</Text>
      </Pressable>
      <Text style={styles.valor}>{valor}</Text>
      <Pressable
        style={[styles.boton, topeAlcanzado && styles.deshabilitado]}
        disabled={topeAlcanzado}
        onPress={() => onChange(valor + 1)}
        accessibilityRole="button"
        accessibilityLabel="Agregar una unidad"
        accessibilityState={{ disabled: topeAlcanzado }}
      >
        <Text style={styles.simbolo}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  boton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deshabilitado: { opacity: 0.35 },
  simbolo: { color: colors.primary, fontSize: 22, fontWeight: '700', lineHeight: 24 },
  valor: { minWidth: 32, textAlign: 'center', fontSize: 17, fontWeight: '700', color: colors.text },
});
