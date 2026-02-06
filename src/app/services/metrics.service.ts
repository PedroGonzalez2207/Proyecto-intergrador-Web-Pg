import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface ResumenDTO {
  total: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
}

export interface SerieDTO {
  dia: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class MetricsService {
  private baseUrl = (environment as any).pythonBaseUrl || 'http://localhost:9000';
  private apiKey = (environment as any).pythonApiKey || 'supersecreto123';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'X-API-KEY': this.apiKey });
  }

  resumen(programadorId: number, from: string, to: string): Observable<ResumenDTO> {
    const params = new HttpParams().set('from_date', from).set('to_date', to);
    return this.http.get<ResumenDTO>(`${this.baseUrl}/metrics/programador/${programadorId}/resumen`, {
      headers: this.headers(),
      params,
    });
  }

  serie(programadorId: number, from: string, to: string): Observable<SerieDTO[]> {
    const params = new HttpParams().set('from_date', from).set('to_date', to);
    return this.http.get<SerieDTO[]>(`${this.baseUrl}/metrics/programador/${programadorId}/serie`, {
      headers: this.headers(),
      params,
    });
  }
}
