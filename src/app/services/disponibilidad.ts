import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface Disponibilidad {
  id?: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  modalidad: 'ONLINE' | 'PRESENCIAL';
}


@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  private base = `${environment.apiBaseUrl}/programadores`;

  constructor(private http: HttpClient) {}

  getByProgramador(programadorId: number): Observable<Disponibilidad[]> {
    return this.http.get<Disponibilidad[]>(`${this.base}/${programadorId}/disponibilidades`);
  }

  add(programadorId: number, dispo: Disponibilidad): Observable<Disponibilidad> {
    return this.http.post<Disponibilidad>(`${this.base}/${programadorId}/disponibilidades`, dispo);
  }
}
