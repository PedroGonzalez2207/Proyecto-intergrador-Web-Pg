import { Injectable, inject } from '@angular/core';
import {
  Auth as FirebaseAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  user
} from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppUser, Role } from '../models/app-user';

@Injectable({
  providedIn: 'root',
})
export class Auth {

  //Servico Auth de Firebase
  private auth: FirebaseAuth = inject(FirebaseAuth);

  //Firestore para guardar Usuarios
  private firestore: Firestore = inject(Firestore);

  //Router para navegar
  private router: Router = inject(Router);

  // Saber si estamos en navegador (no SSR)
  private isBrowser = typeof window !== 'undefined';

  //Correos que serán administradores
  private adminEmails: string[] = [
    'pedrojose.g2207@gmail.com',
  ];

  //Observable del usuario de Firebase
  user$: Observable<any> = user(this.auth);

  constructor() {
    if (this.isBrowser) {
      // Cada vez que Firebase diga "hay usuario logueado"
      this.user$.subscribe(async (firebaseUser) => {
        if (!firebaseUser) {
          return; // no hay sesión
        }

        console.log('user$ emitió usuario:', firebaseUser);

        // Aseguramos que está en BD y obtenemos su rol y demás datos
        const appUser = await this.ensureUserInBd(firebaseUser);
        console.log('AppUser desde user$:', appUser);

      });
    }
  }

  //Iniciar sesion con Google (REDIRECT)
  async loginWithGoogle(): Promise<void> {
    if (!this.isBrowser) {
      console.warn('loginWithGoogle llamado en entorno no navegador');
      return;
    }

    const provider = new GoogleAuthProvider();
    console.log('Auth.loginWithGoogle -> redirect a Google');
    await signInWithRedirect(this.auth, provider);
    // Al volver, user$ emitirá el usuario y se hará la navegación
  }

  //Navegar según rol
  private navigateByRole(role: Role) {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin/usuarios']);
        break;
      case 'Programador':
        this.router.navigate(['/programador/portafolio']);
        break;
      case 'Usuario':
      default:
        this.router.navigate(['/usuario/portafolios']);
        break;
    }
  }

  //Asegurar que existe el usuario en la BD
  async ensureUserInBd(firebaseUser: any): Promise<AppUser> {
    const uid = firebaseUser.uid;
    const email: string = firebaseUser.email || '';
    const displayName: string | null = firebaseUser.displayName;
    const photoURL: string | null = firebaseUser.photoURL;

    const ref = doc(this.firestore, 'users', uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const existing = snap.data() as AppUser;

      const update: AppUser = {
        ...existing,
        email: email || existing.email,
        displayName,
        photoURL,
      };

      await setDoc(ref, update, { merge: true });
      return update;
    }

    let role: Role = 'Usuario';
    if (this.adminEmails.includes(email)) {
      role = 'Admin';
    }

    const newUser: AppUser = {
      uid,
      email,
      displayName,
      photoURL,
      role,
    };

    await setDoc(ref, newUser);
    return newUser;
  }

  //Cerrar sesion
  async logout(): Promise<void> {
    await signOut(this.auth);
    await this.router.navigate(['/login']);
  }

}
