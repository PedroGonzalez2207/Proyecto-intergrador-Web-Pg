export type AsesoriaEstado = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface DisponibilidadDTO {
  id?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  modalidad?: string | null;
  activo?: boolean;
}

export interface AsesoriaDTO {
  id?: number;
  programadorId: number;
  programadorNombre: string;
  usuarioUid: string;
  usuarioNombre: string;
  fecha: string;
  hora: string;
  comentario?: string;
  estado: AsesoriaEstado;
  mensajeProgramador?: string;
  portafolioId?: number | string;
  portafolioTitulo?: string;
}

export interface CrearAsesoriaRequest {
  programadorId: number;
  programadorNombre: string;
  fecha: string;
  hora: string;
  comentario?: string;
  portafolioId?: number | string;
  portafolioTitulo?: string;
}
