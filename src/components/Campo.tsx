import React from 'react';
import { StyleSheet, Text, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { colors, spacing } from '../theme';

interface Props {
  etiqueta: string;
  valor: string;
  onChange: (texto: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  secureTextEntry?: boolean;
  editable?: boolean;
  returnKeyType?: 'done' | 'next' | 'go' | 'search';
  onSubmitEditing?: () => void;
}

export default function Campo({
  etiqueta,
  valor,
  onChange,
  placeholder,
  keyboardType = 'default',
  maxLength,
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  editable = true,
  returnKeyType,
  onSubmitEditing,
}: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        style={[styles.input, !editable && styles.deshabilitado]}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        editable={editable}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 6 },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    fontSize: 16,
    color: colors.text,
  },
  deshabilitado: { backgroundColor: colors.border, color: colors.muted },
});
