import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError } from '../src/api/http';
import { crearPedido } from '../src/api/pedidos';
import Boton from '../src/components/Boton';
import Campo from '../src/components/Campo';
import { Aviso, EstadoVacio } from '../src/components/Estados';
import { useCarrito } from '../src/context/CarritoContext';
import { colors, spacing } from '../src/theme';
import { formatoPesos } from '../src/utils/formato';

export default function ConfirmarScreen() {
  const router = useRouter();
  const carrito = useCarrito();
  const localId = carrito.localId;
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  if (carrito.items.length === 0 || localId === null) {
    return (
      <View style={styles.pantalla}>
        <EstadoVacio
          titulo="No hay productos en el carrito"
          accion={{ titulo: 'Ver locales', onPress: () => router.replace('/') }}
        />
      </View>
    );
  }

  // Se guarda ya estrechado a number para usarlo dentro de `confirmar`.
  const idLocal: number = localId;

  /** Controles básicos para la experiencia; el backend valida todo de nuevo. */
  function validar(): string[] {
    const lista: string[] = [];
    if (!nombre.trim()) lista.push('El nombre es obligatorio.');
    if (!/^\d{8,15}$/.test(telefono.trim())) {
      lista.push('El teléfono debe tener entre 8 y 15 dígitos.');
    }
    if (!direccion.trim()) lista.push('La dirección de entrega es obligatoria.');
    return lista;
  }

  async function confirmar() {
    const lista = validar();
    if (lista.length > 0) {
      setErrores(lista);
      return;
    }

    setErrores([]);
    setEnviando(true);
    try {
      const pedido = await crearPedido({
        localId: idLocal,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccionEntrega: direccion.trim(),
        items: carrito.items.map((item) => ({
          productoId: item.producto.id,
          cantidad: item.cantidad,
        })),
      });
      carrito.setPedidoCreado(pedido);
      router.replace('/resultado');
      carrito.vaciar();
    } catch (e) {
      if (e instanceof ApiError) {
        const detalles = e.detalles.filter((detalle) => detalle !== e.message);
        setErrores([e.message, ...detalles]);
      } else {
        setErrores(['Ocurrió un error inesperado. Intentá de nuevo.']);
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
        <Text style={styles.titulo}>Tus datos</Text>

        <Campo
          etiqueta="Nombre"
          valor={nombre}
          onChange={setNombre}
          placeholder="Ej: Ana Pérez"
          maxLength={80}
          autoCapitalize="words"
        />
        <Campo
          etiqueta="Teléfono"
          valor={telefono}
          onChange={(texto) => setTelefono(texto.replace(/\D/g, ''))}
          placeholder="Solo números (8 a 15 dígitos)"
          keyboardType="phone-pad"
          maxLength={15}
        />
        <Campo
          etiqueta="Dirección de entrega"
          valor={direccion}
          onChange={setDireccion}
          placeholder="Calle, número, piso/depto"
          maxLength={150}
        />

        <Text style={styles.titulo}>Resumen</Text>
        <View style={styles.resumen}>
          <Text style={styles.local}>{carrito.localNombre}</Text>
          {carrito.items.map((item) => (
            <View key={item.producto.id} style={styles.filaItem}>
              <Text style={styles.itemTexto}>
                {item.cantidad} × {item.producto.nombre}
              </Text>
              <Text style={styles.itemTexto}>
                {formatoPesos((Math.round(item.producto.precio * 100) * item.cantidad) / 100)}
              </Text>
            </View>
          ))}
          <View style={[styles.filaItem, styles.filaTotal]}>
            <Text style={styles.subtotalTitulo}>Subtotal estimado</Text>
            <Text style={styles.subtotalValor}>{formatoPesos(carrito.subtotalEstimado)}</Text>
          </View>
          <Text style={styles.nota}>
            El descuento, el envío y el total final los define el servidor al confirmar.
          </Text>
        </View>

        <Aviso mensajes={errores} />

        <Boton titulo="Confirmar pedido" onPress={confirmar} loading={enviando} />
        <Boton
          titulo="Volver al carrito"
          variante="secundario"
          onPress={() => router.back()}
          disabled={enviando}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colors.bg },
  contenido: { padding: spacing.lg, gap: spacing.lg },
  titulo: { fontSize: 18, fontWeight: '800', color: colors.text },
  resumen: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  local: { fontSize: 16, fontWeight: '700', color: colors.text },
  filaItem: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  itemTexto: { color: colors.text, fontSize: 15, flexShrink: 1 },
  filaTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  subtotalTitulo: { fontSize: 15, color: colors.muted },
  subtotalValor: { fontSize: 17, fontWeight: '800', color: colors.text },
  nota: { fontSize: 12, color: colors.muted },
});
