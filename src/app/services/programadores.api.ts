import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export type DateArray = [number, number, number];
export type TimeArray = [number, number] | [number, number, number];

export interface ProyectoPublicDTO {
  id: number;
  categoria: string;
  nombre: string;
  descripcion: string;
  participacion: string;
  tecnologias?: string | null;
  repoUrl?: string | null;
  demoUrl?: string | null;
}

export interface ProgramadorPublicDTO {
  id: number;
  usuarioId: number | null;
  nombre: string;
  bio: string | null;
  especialidades: string | null;
  proyectos?: ProyectoPublicDTO[];
}

export interface DisponibilidadDTO {
  id?: number;
  fecha: string | DateArray;
  horaInicio: string | TimeArray;
  horaFin: string | TimeArray;
  modalidad?: string | null;
  activo?: boolean;
}

export interface CrearDisponibilidadRequest {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  modalidad: string;
}

export const fmtFecha = (v: string | DateArray): string => {
  if (typeof v === 'string') return v;
  const [y, m, d] = v;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
};

export const fmtHora = (v: string | TimeArray): string => {
  if (typeof v === 'string') return v.length >= 5 ? v.slice(0, 5) : v;
  const [h, m] = v;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

@Injectable({ providedIn: 'root' })
export class ProgramadoresApiService {
  private base = `${environment.apiBaseUrl}/programadores`;

  constructor(private http: HttpClient) {}

  list(): Observable<ProgramadorPublicDTO[]> {
    return this.http.get<ProgramadorPublicDTO[]>(this.base);
  }

  detalle(id: number | string): Observable<ProgramadorPublicDTO> {
    const pid = encodeURIComponent(String(id));
    return this.http.get<ProgramadorPublicDTO>(`${this.base}/${pid}`);
  }

  me(): Observable<number> {
    return this.http.get<number>(`${this.base}/me`);
  }

  disponibilidades(programadorId: number | string, fecha?: string): Observable<DisponibilidadDTO[]> {
    const id = encodeURIComponent(String(programadorId));
    const qs = fecha ? `?fecha=${encodeURIComponent(fecha)}` : '';
    return this.http.get<DisponibilidadDTO[]>(`${this.base}/${id}/disponibilidades${qs}`);
  }

  crearDisponibilidad(programadorId: number | string, body: CrearDisponibilidadRequest): Observable<DisponibilidadDTO> {
    const id = encodeURIComponent(String(programadorId));
    return this.http.post<DisponibilidadDTO>(`${this.base}/${id}/disponibilidades`, body);
  }

  eliminarDisponibilidad(programadorId: number | string, dispId: number | string): Observable<void> {
    const pid = encodeURIComponent(String(programadorId));
    const did = encodeURIComponent(String(dispId));
    return this.http.delete<void>(`${this.base}/${pid}/disponibilidades/${did}`);
  }
}
