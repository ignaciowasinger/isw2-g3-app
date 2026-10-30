import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Carta, Pedido, Producto } from '../types/api';

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

type ResultadoAgregar = 'ok' | 'otro_local' | 'sin_stock';

interface CarritoContextValue {
  items: ItemCarrito[];
  localId: number | null;
  localNombre: string | null;
  cantidadTotal: number;
  /** Solo orientativo: el total definitivo lo calcula el backend. */
  subtotalEstimado: number;
  cantidadDe: (productoId: number) => number;
  agregar: (producto: Producto) => ResultadoAgregar;
  reemplazarPor: (producto: Producto) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;
  /** Ajusta el carrito a la carta vigente y devuelve los avisos. */
  sincronizar: (carta: Carta) => string[];
  pedidoCreado: Pedido | null;
  setPedidoCreado: (pedido: Pedido | null) => void;
}

const CarritoContext = createContext<CarritoContextValue | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const cantidadDe = useCallback(
    (id: number) => items.find((item) => item.producto.id === id)?.cantidad ?? 0,
    [items],
  );

  const agregar = useCallback(
    (producto: Producto): ResultadoAgregar => {
      if (items.length > 0 && items[0].producto.localId !== producto.localId) return 'otro_local';
      const existente = items.find((item) => item.producto.id === producto.id);
      const actual = existente?.cantidad ?? 0;
      if (!producto.disponible || actual + 1 > producto.stock) return 'sin_stock';
      setItems(
        existente
          ? items.map((item) =>
              item.producto.id === producto.id ? { ...item, cantidad: actual + 1 } : item,
            )
          : [...items, { producto, cantidad: 1 }],
      );
      return 'ok';
    },
    [items],
  );

  const reemplazarPor = useCallback((producto: Producto) => {
    if (producto.disponible && producto.stock > 0) setItems([{ producto, cantidad: 1 }]);
    else setItems([]);
  }, []);

  const cambiarCantidad = useCallback((id: number, cantidad: number) => {
    setItems((prev) =>
      cantidad <= 0
        ? prev.filter((item) => item.producto.id !== id)
        : prev.map((item) =>
            item.producto.id === id
              ? { ...item, cantidad: Math.min(cantidad, item.producto.stock) }
              : item,
          ),
    );
  }, []);

  const quitar = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.producto.id !== id));
  }, []);

  const vaciar = useCallback(() => setItems([]), []);

  const sincronizar = useCallback((carta: Carta): string[] => {
    const vigentes = new Map<number, Producto>();
    carta.categorias.forEach((categoria) =>
      categoria.productos.forEach((producto) => vigentes.set(producto.id, producto)),
    );

    const avisos: string[] = [];
    const nuevos: ItemCarrito[] = [];
    for (const item of itemsRef.current) {
      const vigente = vigentes.get(item.producto.id);
      if (!vigente || !vigente.disponible || vigente.stock <= 0) {
        avisos.push(`"${item.producto.nombre}" ya no está disponible y se quitó del carrito.`);
        continue;
      }
      let cantidad = item.cantidad;
      if (cantidad > vigente.stock) {
        cantidad = vigente.stock;
        avisos.push(`Quedan solo ${vigente.stock} de "${vigente.nombre}": se ajustó la cantidad.`);
      }
      nuevos.push({ producto: vigente, cantidad });
    }

    const cambiaron =
      nuevos.length !== itemsRef.current.length ||
      nuevos.some((item, indice) => {
        const anterior = itemsRef.current[indice];
        return (
          !anterior ||
          anterior.producto.id !== item.producto.id ||
          anterior.cantidad !== item.cantidad ||
          anterior.producto.precio !== item.producto.precio
        );
      });

    if (cambiaron) setItems(nuevos);
    return avisos;
  }, []);

  const valor = useMemo<CarritoContextValue>(() => {
    const centavos = items.reduce(
      (total, item) => total + Math.round(item.producto.precio * 100) * item.cantidad,
      0,
    );
    return {
      items,
      localId: items.length > 0 ? items[0].producto.localId : null,
      localNombre: items.length > 0 ? items[0].producto.localNombre : null,
      cantidadTotal: items.reduce((total, item) => total + item.cantidad, 0),
      subtotalEstimado: centavos / 100,
      cantidadDe,
      agregar,
      reemplazarPor,
      cambiarCantidad,
      quitar,
      vaciar,
      sincronizar,
      pedidoCreado,
      setPedidoCreado,
    };
  }, [
    items,
    cantidadDe,
    agregar,
    reemplazarPor,
    cambiarCantidad,
    quitar,
    vaciar,
    sincronizar,
    pedidoCreado,
  ]);

  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito(): CarritoContextValue {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error('useCarrito debe usarse dentro de <CarritoProvider>');
  return contexto;
}
