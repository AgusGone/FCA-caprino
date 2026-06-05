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
// Las cabras viven en Supabase. Estos arrays siguen siendo estáticos porque
// los consume Alimentación y por ahora no se editan desde la app.

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