export interface Disponibilidad {
  id?: string;              
  programadorId: string;    
  programadorNombre: string;
  fecha: string;            
  horaInicio: string;       
  horaFin: string;         
}

export type AsesoriaEstado = 'Pendiente' | 'Aprobada' | 'Rechazada';

export interface Asesoria {
  id?: string;
  programadorId: string;
  programadorNombre: string;
  usuarioId: string;
  usuarioNombre: string;
  fecha: string;        
  hora: string;         
  comentario?: string;
  estado: AsesoriaEstado;
  mensajeProgramador?: string; 
}
