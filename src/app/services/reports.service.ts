import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private baseUrl = (environment as any).pythonBaseUrl || 'http://localhost:9000';
  private apiKey = (environment as any).pythonApiKey || 'supersecreto123';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'X-API-KEY': this.apiKey });
  }

  async asesoriaPdf(from?: string, to?: string): Promise<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from_date', from);
    if (to) params = params.set('to_date', to);

    const blob = await firstValueFrom(
      this.http.get(`${this.baseUrl}/reports/asesorias.pdf`, {
        headers: this.headers(),
        params,
        responseType: 'blob',
      })
    );
    return blob;
  }
}
