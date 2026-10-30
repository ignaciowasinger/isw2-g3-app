import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

interface Props {
  titulo: string;
  subtitulo?: string;
  detalle?: string;
  activo: boolean;
  onPress: () => void;
}

/** Fila de las listas de administración (usuarios, locales, productos). */
export default function FilaAdmin({ titulo, subtitulo, detalle, activo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.presionado,
        !activo && styles.inactivo,
      ]}
    >
      <View style={styles.info}>
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={styles.sub}>{subtitulo}</Text> : null}
        {detalle ? <Text style={styles.sub}>{detalle}</Text> : null}
      </View>
      {!activo ? <Text style={styles.etiquetaInactivo}>Inactivo</Text> : null}
    </Pressable>
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
  presionado: { opacity: 0.85 },
  inactivo: { opacity: 0.65 },
  info: { flex: 1, gap: 2 },
  titulo: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 13, color: colors.muted },
  etiquetaInactivo: { color: colors.danger, fontWeight: '700', fontSize: 12 },
});
