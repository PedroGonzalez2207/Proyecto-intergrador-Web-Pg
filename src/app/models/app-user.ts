export type Role = 'Admin' | 'Programador' | 'Usuario';

export interface RedesSociales {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;

  // Campos extra para PROGRAMADOR
  especialidad?: string;
  descripcion?: string;
  fotoPerfil?: string;     
  redes?: RedesSociales;
}
