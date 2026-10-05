// #################### US03 y US04: Datos del catálogo #####################
export interface Calificacion {
  rate: number;
  count: number;
}

export interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating?: Calificacion;
}
// ######################## Fin de US03 y US04 ##############################
