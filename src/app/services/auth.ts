import { Injectable, inject } from '@angular/core';
import {
  Auth as FirebaseAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  user
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  // Servicio Auth de Firebase
  private auth: FirebaseAuth = inject(FirebaseAuth);

  // Router para navegar
  private router: Router = inject(Router);

  // Saber si estamos en navegador (no SSR)
  private isBrowser = typeof window !== 'undefined';

  // Observable del usuario autenticado
  user$: Observable<any> = user(this.auth);

  constructor() {
    if (this.isBrowser) {
      // Cada vez que Firebase diga "hay usuario", lo mando a /admin/usuarios
      this.user$.subscribe((firebaseUser) => {
        console.log('user$ emitió usuario:', firebaseUser);

        if (!firebaseUser) {
          return; // no logueado
        }

        // Pase lo que pase, entra aquí
        this.router.navigate(['/admin/usuarios']);
      });
    }
  }

  // Iniciar sesión con Google (redirect)
  async loginWithGoogle(): Promise<void> {
    if (!this.isBrowser) {
      console.warn('loginWithGoogle llamado en entorno no navegador');
      return;
    }

    const provider = new GoogleAuthProvider();
    console.log('Auth.loginWithGoogle -> redirect a Google');
    await signInWithRedirect(this.auth, provider);
  }

  // Cerrar sesión
  logout(): Promise<any> {
    return signOut(this.auth);
  }

}
