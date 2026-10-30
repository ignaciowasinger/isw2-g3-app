import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';
import type { Local } from '../types/api';

export default function LocalCard({ local, onPress }: { local: Local; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.presionado]}
    >
      <Text style={styles.nombre}>{local.nombre}</Text>
      {local.direccion ? <Text style={styles.detalle}>{local.direccion}</Text> : null}
      {local.telefono ? <Text style={styles.detalle}>Tel. {local.telefono}</Text> : null}
      <Text style={styles.link}>Ver carta ›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presionado: { opacity: 0.85 },
  nombre: { fontSize: 18, fontWeight: '700', color: colors.text },
  detalle: { fontSize: 14, color: colors.muted },
  link: { marginTop: spacing.sm, color: colors.primary, fontWeight: '600' },
});
