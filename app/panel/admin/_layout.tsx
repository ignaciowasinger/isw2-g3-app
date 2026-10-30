import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { Cargando } from '../../../src/components/Estados';
import { useAuth } from '../../../src/context/AuthContext';
import { opcionesStack } from '../../../src/navegacion';

/** Solo ADMIN. El servidor devuelve 403 igualmente a cualquier otro rol. */
export default function AdminLayout() {
  const { esAdmin, cargando } = useAuth();

  if (cargando) return <Cargando texto="Recuperando sesión..." />;
  if (!esAdmin) return <Redirect href="/panel" />;

  return (
    <Stack screenOptions={opcionesStack}>
      <Stack.Screen name="usuarios" options={{ title: 'Usuarios' }} />
      <Stack.Screen name="usuario-form" options={{ title: 'Usuario' }} />
      <Stack.Screen name="locales" options={{ title: 'Locales' }} />
      <Stack.Screen name="local-form" options={{ title: 'Local' }} />
      <Stack.Screen name="productos" options={{ title: 'Productos' }} />
      <Stack.Screen name="producto-form" options={{ title: 'Producto' }} />
      <Stack.Screen name="ventas" options={{ title: 'Ventas por local' }} />
    </Stack>
  );
}
