import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AppUser, Role } from '../models/app-user';
import { environment } from '../../environments/environments';

type RolDb = 'Admin' | 'Programador' | 'Usuario';

interface UsuarioDb {
  id: number;
  firebaseUid: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: RolDb;
  activo: boolean;
  telefono: string | null;
  createdAt: any;
  passwordHash: any;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuariosApiService {
  private base = environment.apiBaseUrl || 'http://localhost:8080/gproyecto-backend/api';

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

  list(): Observable<AppUser[]> {
    return this.http.get<UsuarioDb[]>(`${this.base}/admin/users`).pipe(
      map(rows =>
        rows.map(u => ({
          uid: u.firebaseUid,
          email: u.email,
          displayName: `${u.nombres || ''} ${u.apellidos || ''}`.trim() || u.email,
          photoURL: null,
          role: this.dbToUiRole(u.rol),
        } as AppUser))
      )
    );
  }

  updateRoleById(id: number, role: Role): Observable<any> {
    const rolDb = this.uiToDbRole(role);
    return this.http.put(`${this.base}/admin/users/by-id/${id}/rol/${rolDb}`, {});
  }

  updateRoleByEmail(email: string, role: Role): Observable<any> {
    const rolDb = this.uiToDbRole(role);
    const encEmail = encodeURIComponent((email || '').trim().toLowerCase());
    return this.http.put(`${this.base}/admin/users/by-email/${encEmail}/rol/${rolDb}`, {});
  }
}
