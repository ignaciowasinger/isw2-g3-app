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
import {
  crearProducto,
  editarProducto,
  listarLocalesAdmin,
  obtenerProductoAdmin,
} from '../../../src/api/admin';
import { obtenerCategorias } from '../../../src/api/catalogo';
import { ApiError } from '../../../src/api/http';
import Boton from '../../../src/components/Boton';
import Campo from '../../../src/components/Campo';
import CampoActivo from '../../../src/components/CampoActivo';
import Chips from '../../../src/components/Chips';
import { Aviso, Cargando, ErrorReintentar } from '../../../src/components/Estados';
import { useCargar } from '../../../src/hooks/useCargar';
import { colors, spacing } from '../../../src/theme';

export default function ProductoFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editando = !!id;
  const router = useRouter();
  const { data, loading, error, recargar } = useCargar(async () => {
    const [locales, categorias, producto] = await Promise.all([
      listarLocalesAdmin(),
      obtenerCategorias(),
      id ? obtenerProductoAdmin(Number(id)) : Promise.resolve(null),
    ]);
    return { locales, categorias, producto };
  }, [id]);

  const [localId, setLocalId] = useState<number | null>(null);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [activo, setActivo] = useState(true);
  const [errores, setErrores] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const producto = data?.producto;
    if (!producto) return;
    setLocalId(producto.localId);
    setCategoriaId(producto.categoriaId);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion ?? '');
    setPrecio(String(producto.precio));
    setStock(String(producto.stock));
    setActivo(producto.activo);
  }, [data]);

  if (loading) return <Cargando />;
  if (error || !data) {
    return (
      <ErrorReintentar
        mensaje={error ?? 'No se pudo cargar el formulario.'}
        onReintentar={recargar}
      />
    );
  }

  if (editando && !data.producto) {
    return (
      <ErrorReintentar mensaje="No se encontró el producto." onReintentar={recargar} />
    );
  }

  async function guardar() {
    const precioNormalizado = precio.trim().replace(',', '.');
    const lista: string[] = [];
    if (localId === null) lista.push('Elegí un local.');
    if (categoriaId === null) lista.push('Elegí una categoría.');
    if (!nombre.trim()) lista.push('El nombre es obligatorio.');
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(precioNormalizado)) {
      lista.push('El precio debe ser un número no negativo, con hasta 2 decimales.');
    }
    if (!/^\d+$/.test(stock.trim())) {
      lista.push('El stock debe ser un entero de 0 o más.');
    }
    if (lista.length > 0) {
      setErrores(lista);
      return;
    }

    setErrores([]);
    setEnviando(true);
    try {
      const datos = {
        localId: localId as number,
        categoriaId: categoriaId as number,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: Number(precioNormalizado),
        stock: Number(stock.trim()),
        activo,
      };
      if (editando) await editarProducto(Number(id), datos);
      else await crearProducto(datos);
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
      <Stack.Screen options={{ title: editando ? 'Editar producto' : 'Nuevo producto' }} />
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.etiqueta}>Local</Text>
        {data.locales.length === 0 ? (
          <Aviso
            tipo="info"
            mensajes={['No hay locales creados. Creá uno en Administración › Locales.']}
          />
        ) : (
          <View style={styles.chips}>
            <Chips<number | null>
              opciones={data.locales.map((local) => ({
                valor: local.id as number | null,
                etiqueta: local.nombre,
              }))}
              seleccionado={localId}
              onSeleccionar={setLocalId}
            />
          </View>
        )}

        <Text style={styles.etiqueta}>Categoría</Text>
        <View style={styles.chips}>
          <Chips<number | null>
            opciones={data.categorias.map((categoria) => ({
              valor: categoria.id as number | null,
              etiqueta: categoria.nombre,
            }))}
            seleccionado={categoriaId}
            onSeleccionar={setCategoriaId}
          />
        </View>

        <Campo etiqueta="Nombre" valor={nombre} onChange={setNombre} maxLength={80} />
        <Campo
          etiqueta="Descripción (opcional)"
          valor={descripcion}
          onChange={setDescripcion}
          maxLength={200}
        />
        <Campo
          etiqueta="Precio"
          valor={precio}
          onChange={setPrecio}
          keyboardType="decimal-pad"
          placeholder="Ej: 4500.50"
        />
        <Campo
          etiqueta="Stock"
          valor={stock}
          onChange={(texto) => setStock(texto.replace(/\D/g, ''))}
          keyboardType="numeric"
          maxLength={9}
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
  etiqueta: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: -spacing.md },
  chips: { marginHorizontal: -spacing.lg, marginTop: -spacing.md },
});
