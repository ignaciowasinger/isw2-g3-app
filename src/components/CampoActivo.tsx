import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../theme';

interface Props {
  valor: boolean;
  onChange: (valor: boolean) => void;
  etiqueta?: string;
}

export default function CampoActivo({ valor, onChange, etiqueta = 'Activo' }: Props) {
  return (
    <View style={styles.fila}>
      <Text style={styles.texto}>{etiqueta}</Text>
      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{ false: colors.border, true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  texto: { fontSize: 16, fontWeight: '600', color: colors.text },
});
