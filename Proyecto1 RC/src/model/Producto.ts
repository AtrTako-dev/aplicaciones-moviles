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