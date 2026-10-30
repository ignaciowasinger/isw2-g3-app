import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { Cargando } from '../../src/components/Estados';
import { useAuth } from '../../src/context/AuthContext';
import { opcionesStack } from '../../src/navegacion';

/** Todo lo que está bajo /panel exige sesión. La seguridad real sigue en el backend. */
export default function PanelLayout() {
  const { sesion, cargando } = useAuth();

  if (cargando) return <Cargando texto="Recuperando sesión..." />;
  if (!sesion) return <Redirect href="/login" />;

  return (
    <Stack screenOptions={opcionesStack}>
      <Stack.Screen name="index" options={{ title: 'Panel del personal' }} />
      <Stack.Screen name="pedidos" options={{ title: 'Pedidos' }} />
      <Stack.Screen name="pedido/[id]" options={{ title: 'Detalle del pedido' }} />
      <Stack.Screen name="en-calle" options={{ title: 'Pedidos en la calle' }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}
