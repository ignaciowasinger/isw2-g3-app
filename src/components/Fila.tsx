import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export function Fila({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <View style={styles.fila}>
      <Text style={[styles.texto, destacado && styles.destacado, styles.etiqueta]}>{etiqueta}</Text>
      <Text style={[styles.texto, destacado && styles.destacado]}>{valor}</Text>
    </View>
  );
}

export function Separador() {
  return <View style={styles.separador} />;
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  texto: { fontSize: 15, color: colors.text },
  etiqueta: { flexShrink: 1 },
  destacado: { fontSize: 18, fontWeight: '800' },
  separador: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
