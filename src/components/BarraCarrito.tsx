import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { formatoPesos } from '../utils/formato';

interface Props {
  cantidad: number;
  subtotal: number;
  onPress: () => void;
}

/** Barra inferior con acceso al carrito. No se muestra si está vacío. */
export default function BarraCarrito({ cantidad, subtotal, onPress }: Props) {
  if (cantidad === 0) return null;
  return (
    <SafeAreaView edges={['bottom']} style={styles.contenedor}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.barra, pressed && styles.presionado]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeTexto}>{cantidad}</Text>
        </View>
        <Text style={styles.texto}>Ver carrito</Text>
        <Text style={styles.texto}>{formatoPesos(subtotal)}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  barra: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  presionado: { opacity: 0.9 },
  badge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeTexto: { color: colors.primary, fontWeight: '800' },
  texto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
