import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth as FirebaseAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user
} from '@angular/fire/auth';

import {
  Firestore,
  doc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';

import { AppUser, Role } from '../models/app-user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  user$: Observable<any>;

  private adminEmails: string[] = [
    'pedrojose.g2207@gmail.com'
  ];

  constructor(
    private auth: FirebaseAuth,
    private firestore: Firestore,
    private router: Router,
  ) {
    this.user$ = user(this.auth);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  //Guarda usuario en Firestore
  async ensureUserInBd(firebaseUser: any): Promise<AppUser> {
    if (!firebaseUser) return {} as AppUser;

    const email = firebaseUser.email.toLowerCase();
    const displayName = firebaseUser.displayName || '';
    const photoUrl = firebaseUser.photoURL || '';

    const userRef = doc(this.firestore, `users/${firebaseUser.uid}`);
    const userSnap = await getDoc(userRef);

    // Si NO existe → lo creamos por primera vez
    if (!userSnap.exists()) {
      let role: Role = 'Usuario';

      if (this.adminEmails.includes(email)) {
        role = 'Admin';
      }

      const appUser: AppUser = {
        uid: firebaseUser.uid,
        email,
        displayName,
        role,
        photoURL: photoUrl,
      };

      await setDoc(userRef, appUser);
      return appUser;
    }

    // Si ya existe → devolvemos los datos
    return userSnap.data() as AppUser;
  }

  // Redirección según rol
  public navigateByRole(role: Role) {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin/usuarios']);
        break;
      case 'Programador':
        this.router.navigate(['/programador/portafolio']);
        break;
      case 'Usuario':
      default:
        this.router.navigate(['/usuario']);
        break;
    }
  }
}
