// --- TIPOS ---
export type EstadoReproductivo = "En lactancia" | "Gestante" | "Seca" | "Vacía" | "Cabrita";

export type Cabra = {
  id: string;
  caravana: string;
  nacimiento: string;
  edad: string;
  estado: EstadoReproductivo;
  partos: number;
  promedio: number;
  dot: "verde" | "azul" | "naranja" | "gris";
  produccion: Array<{ mes: string; litros: number }>;
  historialPartos: Array<{ fecha: string; crias: number; observacion: string }>;
  sanidad: Array<{ fecha: string; evento: string; detalle: string }>;
  crias: string[];
  observaciones: string; // <--- AGREGA ESTO
};

// --- DATOS ---

export const racionDiaria = [
  { estado: "En lactancia", cantidad: "1.5 kg" },
  { estado: "Gestante", cantidad: "1.2 kg" },
  { estado: "Seca", cantidad: "0.8 kg" },
  { estado: "Vacía", cantidad: "0.5 kg" },
  { estado: "Cabrita", cantidad: "0.4 kg" },
];

export const horariosSuministro = [
  { turno: "Mañana", hora: "07:00 AM" },
  { turno: "Tarde", hora: "04:00 PM" },
];

export const cabras: Cabra[] = [
  { 
    id: "0001", 
    caravana: "001", 
    nacimiento: "2023-01-01", 
    edad: "1 año", 
    estado: "En lactancia", 
    partos: 1, 
    promedio: 2.5, 
    dot: "verde", 
    produccion: [], 
    historialPartos: [], 
    sanidad: [],
    crias: [],
    observaciones: "" // <--- AGREGA ESTO
  },
  { 
    id: "0002", 
    caravana: "002", 
    nacimiento: "2023-01-01", 
    edad: "1 año", 
    estado: "En lactancia", 
    partos: 1, 
    promedio: 2.5, 
    dot: "verde", 
    produccion: [], 
    historialPartos: [], 
    sanidad: [],
    crias: [],
    observaciones: "" // <--- AGREGA ESTO
  }
];