import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Boton from '../../src/components/Boton';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing } from '../../src/theme';

export default function PanelScreen() {
  const router = useRouter();
  const { sesion, esAdmin, logout } = useAuth();

  async function salir() {
    router.replace('/');
    await logout();
  }

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      <View style={styles.saludo}>
        <Text style={styles.nombre}>{sesion?.nombre}</Text>
        <Text style={styles.rol}>{esAdmin ? 'Administrador' : 'Operador'}</Text>
        <Text style={styles.usuario}>@{sesion?.username}</Text>
      </View>

      <Text style={styles.seccion}>Operación</Text>
      <Boton titulo="Pedidos" onPress={() => router.push('/panel/pedidos')} />
      <Boton titulo="Pedidos en la calle" onPress={() => router.push('/panel/en-calle')} />

      {esAdmin ? (
        <>
          <Text style={styles.seccion}>Administración</Text>
          <Boton titulo="Usuarios" onPress={() => router.push('/panel/admin/usuarios')} />
          <Boton titulo="Locales" onPress={() => router.push('/panel/admin/locales')} />
          <Boton titulo="Productos" onPress={() => router.push('/panel/admin/productos')} />
          <Boton titulo="Ventas por local" onPress={() => router.push('/panel/admin/ventas')} />
        </>
      ) : null}

      <View style={styles.salir}>
        <Boton titulo="Cerrar sesión" variante="peligro" onPress={salir} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.md },
  saludo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nombre: { fontSize: 18, fontWeight: '800', color: colors.text },
  rol: { color: colors.muted, marginTop: 2 },
  usuario: { color: colors.muted, fontSize: 13, marginTop: 2 },
  seccion: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  salir: { marginTop: spacing.lg },
});
