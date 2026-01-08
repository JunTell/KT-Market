// src/types/db.ts

export interface Device {
  model: string; // PK
  pet_name: string | null;
  company: string | null;
  price: number | null;
  is_available: boolean | null;
  colors_kr: string[];
  capacities: string[];
  images: any; // jsonb
  thumbnail: string | null;
  release_date: string | null;
  category?: string | null;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  network_type: string;
  is_active: boolean;
}