import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environments';

export type Channel = 'email' | 'telegram';

export interface SendNotificationRequest {
  channels: Channel[];
  to_email?: string;
  telegram_chat_id?: string;
  subject?: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private baseUrl = (environment as any).pythonBaseUrl || 'http://localhost:9000';
  private apiKey = (environment as any).pythonApiKey || 'supersecreto123';

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'X-API-KEY': this.apiKey });
  }

  send(req: SendNotificationRequest): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/notifications/send`, req, { headers: this.headers() })
    );
  }
}
