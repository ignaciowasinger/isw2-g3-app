import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { crearUsuario, editarUsuario, obtenerUsuario } from '../../../src/api/admin';
import { ApiError } from '../../../src/api/http';
import Boton from '../../../src/components/Boton';
import Campo from '../../../src/components/Campo';
import CampoActivo from '../../../src/components/CampoActivo';
import Chips from '../../../src/components/Chips';
import { Aviso, Cargando, ErrorReintentar } from '../../../src/components/Estados';
import { useAuth } from '../../../src/context/AuthContext';
import { useCargar } from '../../../src/hooks/useCargar';
import { colors, spacing } from '../../../src/theme';
import type { Rol, Usuario } from '../../../src/types/api';

const ROLES: { valor: Rol; etiqueta: string }[] = [
  { valor: 'OPERADOR', etiqueta: 'Operador' },
  { valor: 'ADMIN', etiqueta: 'Administrador' },
];

export default function UsuarioFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editando = !!id;
  const router = useRouter();
  const { sesion } = useAuth();
  const { data, loading, error, recargar } = useCargar<Usuario | null>(
    () => (id ? obtenerUsuario(Number(id)) : Promise.resolve(null)),
    [id],
  );

  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<Rol>('OPERADOR');
  const [password, setPassword] = useState('');
  const [activo, setActivo] = useState(true);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!data) return;
    setUsername(data.username);
    setNombre(data.nombreCompleto);
    setRol(data.rol);
    setActivo(data.activo);
  }, [data]);

  if (loading) return <Cargando />;
  if (error) return <ErrorReintentar mensaje={error} onReintentar={recargar} />;
  if (editando && !data) {
    return <ErrorReintentar mensaje="No se encontró el usuario." onReintentar={recargar} />;
  }

  // RN-09: un administrador no puede desactivarse ni quitarse el rol a sí mismo.
  const esYo = editando && data?.username === sesion?.username;

  async function guardar() {
    const lista: string[] = [];
    if (!editando && !username.trim()) lista.push('El usuario es obligatorio.');
    if (!nombre.trim()) lista.push('El nombre completo es obligatorio.');
    if ((!editando || password.length > 0) && password.length < 8) {
      lista.push('La contraseña debe tener al menos 8 caracteres.');
    }
    if (lista.length > 0) {
      setErrores(lista);
      return;
    }

    setErrores([]);
    setEnviando(true);
    try {
      if (editando && data) {
        await editarUsuario(data.id, {
          nombreCompleto: nombre.trim(),
          rol: esYo ? data.rol : rol,
          activo: esYo ? true : activo,
          ...(password.length > 0 ? { password } : {}),
        });
      } else {
        await crearUsuario({
          username: username.trim(),
          password,
          nombreCompleto: nombre.trim(),
          rol,
        });
      }
      router.back();
    } catch (e) {
      setErrores(e instanceof ApiError ? [e.message, ...e.detalles] : ['Ocurrió un error inesperado.']);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: editando ? 'Editar usuario' : 'Nuevo usuario' }} />
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Campo
          etiqueta="Usuario"
          valor={username}
          onChange={setUsername}
          autoCapitalize="none"
          maxLength={40}
          editable={!editando}
        />
        <Campo
          etiqueta="Nombre completo"
          valor={nombre}
          onChange={setNombre}
          autoCapitalize="words"
          maxLength={100}
        />
        <Campo
          etiqueta={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          valor={password}
          onChange={setPassword}
          secureTextEntry
          autoCapitalize="none"
          placeholder="Mínimo 8 caracteres"
          maxLength={72}
        />

        {esYo ? (
          <Text style={styles.nota}>
            Sos vos: no podés desactivarte ni quitarte el rol de administrador.
          </Text>
        ) : (
          <>
            <Text style={styles.etiqueta}>Rol</Text>
            <View style={styles.chips}>
              <Chips<Rol> opciones={ROLES} seleccionado={rol} onSeleccionar={setRol} />
            </View>
            {editando ? <CampoActivo valor={activo} onChange={setActivo} /> : null}
          </>
        )}

        <Aviso mensajes={errores} />
        <Boton titulo="Guardar" onPress={guardar} loading={enviando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  etiqueta: { fontSize: 14, fontWeight: '600', color: colors.text },
  chips: { marginHorizontal: -spacing.lg, marginTop: -spacing.md },
  nota: { color: colors.muted, fontSize: 14 },
});
