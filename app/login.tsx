import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Redirect } from 'expo-router';
import { ApiError } from '../src/api/http';
import Boton from '../src/components/Boton';
import Campo from '../src/components/Campo';
import { Aviso, Cargando } from '../src/components/Estados';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing } from '../src/theme';

export default function LoginScreen() {
  const { sesion, cargando, aviso, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  if (cargando) return <Cargando texto="Recuperando sesión..." />;
  if (sesion) return <Redirect href="/panel" />;

  async function ingresar() {
    if (!username.trim() || !password) {
      setErrores(['Ingresá tu usuario y tu contraseña.']);
      return;
    }
    setErrores([]);
    setEnviando(true);
    try {
      await login(username, password);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setErrores(['Usuario o contraseña incorrectos.']);
      } else if (e instanceof ApiError) {
        setErrores([e.message]);
      } else {
        setErrores(['No se pudo iniciar sesión. Intentá de nuevo.']);
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Acceso del personal</Text>
        <Text style={styles.subtitulo}>Ingresá con tu usuario para operar los pedidos.</Text>

        <Aviso mensajes={aviso ? [aviso] : []} tipo="info" />

        <Campo
          etiqueta="Usuario"
          valor={username}
          onChange={setUsername}
          autoCapitalize="none"
          maxLength={40}
          returnKeyType="next"
        />
        <Campo
          etiqueta="Contraseña"
          valor={password}
          onChange={setPassword}
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={() => {
            if (!enviando) void ingresar();
          }}
        />

        <Aviso mensajes={errores} />
        <Boton titulo="Ingresar" onPress={ingresar} loading={enviando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitulo: { fontSize: 15, color: colors.muted, marginTop: -spacing.sm },
});
