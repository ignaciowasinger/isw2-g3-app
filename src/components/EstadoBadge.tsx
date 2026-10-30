import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const COLORES: Record<string, { bg: string; fg: string }> = {
  RECIBIDO: { bg: colors.infoBg, fg: colors.infoText },
  EN_PREPARACION: { bg: colors.warnBg, fg: colors.warnText },
  EN_CAMINO: { bg: colors.purpleBg, fg: colors.purpleText },
  ENTREGADO: { bg: colors.okBg, fg: colors.ok },
  CANCELADO: { bg: colors.dangerBg, fg: colors.danger },
};

export const etiquetaEstado = (estado: string) => estado.replace(/_/g, ' ');

export default function EstadoBadge({ estado }: { estado: string }) {
  const color = COLORES[estado] ?? { bg: colors.border, fg: colors.text };
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.texto, { color: color.fg }]}>{etiquetaEstado(estado)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  texto: { fontSize: 12, fontWeight: '800' },
});
