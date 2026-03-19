import { Category } from "@/shared/types";

export const categories: Category[] = [
  { id: "cpu", name: "Procesadores", slug: "procesadores", icon: "Cpu", count: 8 },
  { id: "gpu", name: "Tarjetas Gráficas", slug: "tarjetas-graficas", icon: "Monitor", count: 6 },
  { id: "ram", name: "Memoria RAM", slug: "memoria-ram", icon: "MemoryStick", count: 5 },
  { id: "storage", name: "Almacenamiento", slug: "almacenamiento", icon: "HardDrive", count: 6 },
  { id: "motherboard", name: "Placas Madre", slug: "placas-madre", icon: "CircuitBoard", count: 4 },
  { id: "psu", name: "Fuentes de Poder", slug: "fuentes-de-poder", icon: "Zap", count: 4 },
  { id: "monitor", name: "Monitores", slug: "monitores", icon: "Monitor", count: 4 },
  { id: "peripherals", name: "Periféricos", slug: "perifericos", icon: "Mouse", count: 6 },
  { id: "accessories", name: "Accesorios PC", slug: "accesorios", icon: "Settings", count: 3 },
];
