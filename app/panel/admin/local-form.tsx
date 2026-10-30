import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { crearLocal, editarLocal, obtenerLocalAdmin } from '../../../src/api/admin';
import { ApiError } from '../../../src/api/http';
import Boton from '../../../src/components/Boton';
import Campo from '../../../src/components/Campo';
import CampoActivo from '../../../src/components/CampoActivo';
import { Aviso, Cargando, ErrorReintentar } from '../../../src/components/Estados';
import { useCargar } from '../../../src/hooks/useCargar';
import { colors, spacing } from '../../../src/theme';
import type { Local } from '../../../src/types/api';

export default function LocalFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editando = !!id;
  const router = useRouter();
  const { data, loading, error, recargar } = useCargar<Local | null>(
    () => (id ? obtenerLocalAdmin(Number(id)) : Promise.resolve(null)),
    [id],
  );

  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [activo, setActivo] = useState(true);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!data) return;
    setNombre(data.nombre);
    setDireccion(data.direccion ?? '');
    setTelefono(data.telefono ?? '');
    setActivo(data.activo);
  }, [data]);

  if (loading) return <Cargando />;
  if (error) return <ErrorReintentar mensaje={error} onReintentar={recargar} />;
  if (editando && !data) {
    return <ErrorReintentar mensaje="No se encontró el local." onReintentar={recargar} />;
  }

  async function guardar() {
    if (!nombre.trim()) {
      setErrores(['El nombre es obligatorio.']);
      return;
    }
    setErrores([]);
    setEnviando(true);
    try {
      const datos = {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        activo,
      };
      if (editando) await editarLocal(Number(id), datos);
      else await crearLocal(datos);
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
      <Stack.Screen options={{ title: editando ? 'Editar local' : 'Nuevo local' }} />
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Campo etiqueta="Nombre" valor={nombre} onChange={setNombre} maxLength={80} autoCapitalize="words" />
        <Campo etiqueta="Dirección (opcional)" valor={direccion} onChange={setDireccion} maxLength={120} />
        <Campo
          etiqueta="Teléfono (opcional)"
          valor={telefono}
          onChange={setTelefono}
          maxLength={15}
          keyboardType="phone-pad"
        />
        {editando ? <CampoActivo valor={activo} onChange={setActivo} /> : null}
        <Aviso mensajes={errores} />
        <Boton titulo="Guardar" onPress={guardar} loading={enviando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
});
