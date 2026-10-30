import React from 'react';
import Chips from './Chips';

interface Props {
  categorias: { id: number; nombre: string }[];
  seleccionada: number | null;
  onSeleccionar: (id: number | null) => void;
}

export default function CategoriaChips({ categorias, seleccionada, onSeleccionar }: Props) {
  const opciones: { valor: number | null; etiqueta: string }[] = [
    { valor: null, etiqueta: 'Todas' },
    ...categorias.map((categoria) => ({ valor: categoria.id, etiqueta: categoria.nombre })),
  ];
  return (
    <Chips<number | null>
      opciones={opciones}
      seleccionado={seleccionada}
      onSeleccionar={onSeleccionar}
    />
  );
}
