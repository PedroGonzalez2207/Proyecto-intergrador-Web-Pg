export type Role = 'Admin' | 'Programador' | 'Usuario';

export interface RedesSociales {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
}

export interface PortafolioUsuario {
  id: number;
  categoria: 'Academico' | 'Laboral';
  nombre: string;
  descripcion: string;
  participacion: 'Frontend' | 'Backend' | 'BaseDeDatos' | 'Fullstack';
  tecnologias: string;
  repoUrl?: string;
  demoUrl?: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  especialidad?: string;
  descripcion?: string;
  fotoPerfil?: string;
  redes?: RedesSociales;
  portafolios?: PortafolioUsuario[];
}
