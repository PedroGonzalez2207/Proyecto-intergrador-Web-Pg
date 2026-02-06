import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth as FirebaseAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
} from '@angular/fire/auth';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable, BehaviorSubject } from 'rxjs';

import { AppUser, Role } from '../models/app-user';
import { environment } from '../../environments/environments';

type WhoAmIResponse = {
  uid: string;
  email: string;
  name: string;
  rol: string;
};

@Injectable({ providedIn: 'root' })
export class Auth {
  user$: Observable<any>;
  jwtReady$: BehaviorSubject<boolean>;

  constructor(
    private auth: FirebaseAuth,
    private router: Router,
    private http: HttpClient
  ) {
    this.user$ = user(this.auth);
    this.jwtReady$ = new BehaviorSubject<boolean>(!!this.safeGetJwt());
  }

  private safeGetJwt(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem('jwt');
    } catch {
      return null;
    }
  }

  private safeSetJwt(token: string) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('jwt', token);
    } catch {}
  }

  private safeRemoveJwt() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem('jwt');
    } catch {}
  }

  private safeSetRole(role: Role) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('jwt_rol', role);
    } catch {}
  }

  private safeRemoveRole() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem('jwt_rol');
    } catch {}
  }

  async loginWithGoogle(): Promise<void> {
    this.safeRemoveJwt();
    this.safeRemoveRole();
    this.jwtReady$.next(false);

    await signOut(this.auth);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const cred = await signInWithPopup(this.auth, provider);

    const firebaseUser = cred.user;
    if (!firebaseUser) throw new Error('No se obtuvo usuario de Firebase');

    const idToken = await firebaseUser.getIdToken(true);

    const authServiceBase =
      (environment as any).authServiceBaseUrl ?? 'http://localhost:8081/api/auth';

    const resp: any = await firstValueFrom(
      this.http.post(`${authServiceBase}/firebase`, { idToken })
    );

    if (!resp?.token) throw new Error('Spring no devolvió token');

    this.safeSetJwt(resp.token);
    this.jwtReady$.next(true);

    const apiBase =
      (environment as any).apiBaseUrl ?? 'http://localhost:8080/gproyecto-backend/api';

    const who: WhoAmIResponse = await firstValueFrom(
      this.http.get<WhoAmIResponse>(`${apiBase}/whoami`)
    );

    const role = this.normalizeRole(who?.rol);
    this.safeSetRole(role);

    this.navigateByRole(role);
  }

  logout(): void {
    this.safeRemoveJwt();
    this.safeRemoveRole();
    this.jwtReady$.next(false);

    signOut(this.auth).then(() => {
      this.router.navigate(['/login']).then(() => location.reload());
    });
  }


  public navigateByRole(role: Role) {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin/usuarios']);
        break;
      case 'Programador':
        this.router.navigate(['/programador/portafolio']);
        break;
      default:
        this.router.navigate(['/usuario']);
        break;
    }
  }

  private normalizeRole(r: any): Role {
    const s = String(r || '').trim().toLowerCase();
    if (s === 'admin') return 'Admin';
    if (s === 'programador') return 'Programador';
    return 'Usuario';
  }
}