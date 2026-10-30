import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  disabled?: boolean;
  loading?: boolean;
}

export default function Boton({
  titulo,
  onPress,
  variante = 'primario',
  disabled = false,
  loading = false,
}: Props) {
  const inactivo = disabled || loading;
  const colorTexto =
    variante === 'primario' ? '#FFFFFF' : variante === 'peligro' ? colors.danger : colors.primary;
  const colorIndicador = variante === 'primario' ? '#FFFFFF' : colorTexto;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo, busy: loading }}
      disabled={inactivo}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variante === 'primario' && styles.primario,
        variante === 'secundario' && styles.secundario,
        variante === 'peligro' && styles.peligro,
        inactivo && styles.inactivo,
        pressed && !inactivo && styles.presionado,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colorIndicador} />
      ) : (
        <Text style={[styles.texto, { color: colorTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: colors.primary },
  secundario: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
  peligro: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.danger },
  inactivo: { opacity: 0.5 },
  presionado: { opacity: 0.85 },
  texto: { fontSize: 16, fontWeight: '600' },
});
