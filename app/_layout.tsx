import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { CarritoProvider } from '../src/context/CarritoContext';
import { opcionesStack } from '../src/navegacion';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <StatusBar style="light" />
        <Stack screenOptions={opcionesStack}>
          <Stack.Screen name="index" options={{ title: 'Sabores del Litoral' }} />
          <Stack.Screen name="local/[id]" options={{ title: 'Carta' }} />
          <Stack.Screen name="carrito" options={{ title: 'Tu carrito' }} />
          <Stack.Screen name="confirmar" options={{ title: 'Confirmar pedido' }} />
          <Stack.Screen
            name="resultado"
            options={{ title: 'Pedido confirmado', headerBackVisible: false, gestureEnabled: false }}
          />
          <Stack.Screen name="seguimiento" options={{ title: 'Seguir mi pedido' }} />
          <Stack.Screen name="login" options={{ title: 'Ingresar' }} />
          <Stack.Screen name="panel" options={{ headerShown: false }} />
        </Stack>
      </CarritoProvider>
    </AuthProvider>
  );
}
