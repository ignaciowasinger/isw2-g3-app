import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';
import Boton from './Boton';

export function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{texto}</Text>
    </View>
  );
}

export function EstadoVacio({
  titulo,
  detalle,
  accion,
}: {
  titulo: string;
  detalle?: string;
  accion?: { titulo: string; onPress: () => void };
}) {
  return (
    <View style={styles.centro}>
      <Text style={styles.titulo}>{titulo}</Text>
      {detalle ? <Text style={styles.muted}>{detalle}</Text> : null}
      {accion ? (
        <Boton titulo={accion.titulo} onPress={accion.onPress} variante="secundario" />
      ) : null}
    </View>
  );
}

export function ErrorReintentar({
  mensaje,
  onReintentar,
}: {
  mensaje: string;
  onReintentar: () => void;
}) {
  return (
    <View style={styles.centro}>
      <Text style={[styles.titulo, { color: colors.danger }]}>No se pudo cargar</Text>
      <Text style={styles.muted}>{mensaje}</Text>
      <Boton titulo="Reintentar" onPress={onReintentar} />
    </View>
  );
}

/** Caja de errores o avisos dentro de un formulario o pantalla. */
export function Aviso({
  mensajes,
  tipo = 'error',
}: {
  mensajes: string[];
  tipo?: 'error' | 'info';
}) {
  if (mensajes.length === 0) return null;
  const esError = tipo === 'error';
  return (
    <View
      accessibilityRole="alert"
      style={[styles.aviso, { backgroundColor: esError ? colors.dangerBg : colors.warnBg }]}
    >
      {mensajes.map((mensaje, indice) => (
        <Text
          key={`${indice}-${mensaje}`}
          style={{ color: esError ? colors.danger : colors.warnText, fontSize: 14 }}
        >
          {mensaje}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  titulo: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  muted: { color: colors.muted, textAlign: 'center', fontSize: 15 },
  aviso: { borderRadius: 8, padding: spacing.md, gap: spacing.xs },
});
