import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ApiError } from '../src/api/http';
import { consultarSeguimiento } from '../src/api/pedidos';
import Boton from '../src/components/Boton';
import Campo from '../src/components/Campo';
import EstadoBadge from '../src/components/EstadoBadge';
import { Aviso } from '../src/components/Estados';
import { Fila } from '../src/components/Fila';
import ResumenMontos from '../src/components/ResumenMontos';
import { colors, spacing } from '../src/theme';
import type { EstadoPedido, Pedido } from '../src/types/api';
import { formatoFecha } from '../src/utils/formato';

const DESCRIPCION_ESTADO: Record<EstadoPedido, string> = {
  RECIBIDO: 'El local recibió tu pedido.',
  EN_PREPARACION: 'Están preparando tu pedido.',
  EN_CAMINO: 'Tu pedido está en camino.',
  ENTREGADO: 'Tu pedido fue entregado. ¡Que lo disfrutes!',
  CANCELADO: 'El pedido fue cancelado.',
};

const normalizar = (texto: string) => texto.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

export default function SeguimientoScreen() {
  const { codigo: codigoParam } = useLocalSearchParams<{ codigo?: string }>();
  const [codigo, setCodigo] = useState(() => normalizar(codigoParam ?? ''));
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [errores, setErrores] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);

  async function consultar() {
    const normalizado = codigo.trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(normalizado)) {
      setErrores(['El código tiene 8 caracteres: letras mayúsculas y números.']);
      setPedido(null);
      return;
    }

    setErrores([]);
    setCargando(true);
    try {
      setPedido(await consultarSeguimiento(normalizado));
    } catch (e) {
      setPedido(null);
      if (e instanceof ApiError && e.status === 404) {
        setErrores(['No encontramos un pedido con ese código.']);
      } else {
        setErrores([e instanceof ApiError ? e.message : 'Ocurrió un error inesperado.']);
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.pantalla}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Campo
          etiqueta="Código de seguimiento"
          valor={codigo}
          onChange={(texto) => setCodigo(normalizar(texto))}
          placeholder="Ej: A1B2C3D4"
          maxLength={8}
          autoCapitalize="characters"
          returnKeyType="search"
          onSubmitEditing={() => {
            if (!cargando) void consultar();
          }}
        />
        <Boton titulo="Consultar" onPress={consultar} loading={cargando} />
        <Aviso mensajes={errores} />

        {pedido ? (
          <>
            <View style={styles.card}>
              <EstadoBadge estado={pedido.estado} />
              <Text style={styles.descripcion}>{DESCRIPCION_ESTADO[pedido.estado]}</Text>
              <Fila etiqueta="Local" valor={pedido.localNombre} />
              <Fila etiqueta="Fecha" valor={formatoFecha(pedido.fechaHora)} />
            </View>
            <ResumenMontos
              items={pedido.items}
              subtotal={pedido.subtotal}
              descuento={pedido.descuento}
              costoEnvio={pedido.costoEnvio}
              total={pedido.total}
            />
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descripcion: { fontSize: 15, color: colors.text },
});
