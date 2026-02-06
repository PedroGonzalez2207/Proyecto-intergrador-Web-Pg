import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environments';
import { AppUser, Role } from '../models/app-user';

type RolDb = 'Admin' | 'Programador' | 'Usuario';

interface UsuarioDb {
  id: number;
  firebaseUid: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: RolDb;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuariosApiService {
  private base =
    environment.apiBaseUrl || 'http://localhost:8080/gproyecto-backend/api';

  constructor(private http: HttpClient) {}

  private dbToUiRole(rol: any): Role {
    const s = String(rol || '').trim().toLowerCase();
    if (s === 'admin') return 'Admin';
    if (s === 'programador') return 'Programador';
    return 'Usuario';
  }

  private uiToDbRole(role: Role): RolDb {
    if (role === 'Admin') return 'Admin';
    if (role === 'Programador') return 'Programador';
    return 'Usuario';
  }

  listAdminUsers(): Observable<AppUser[]> {
    return this.http.get<UsuarioDb[]>(`${this.base}/admin/users`).pipe(
      map((rows) =>
        (rows || []).map((u) => ({
          uid: u.firebaseUid,
          email: (u.email || '').toLowerCase(),
          displayName: `${u.nombres || ''} ${u.apellidos || ''}`.trim() || u.email,
          photoURL: null,
          role: this.dbToUiRole(u.rol),
        }))
      )
    );
  }

  updateRoleByEmail(email: string, role: Role): Observable<void> {
    const rolDb = this.uiToDbRole(role);
    const encEmail = encodeURIComponent((email || '').trim().toLowerCase());
    return this.http.put<void>(
      `${this.base}/admin/users/by-email/${encEmail}/rol/${rolDb}`,
      {}
    );
  }
}
