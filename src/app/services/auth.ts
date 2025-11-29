import { Injectable, inject } from '@angular/core';
import { Auth as FirebaseAuth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { reauthenticateWithCredential } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class Auth {

  //Servico Auth de Firebase
  private auth: FirebaseAuth = inject(FirebaseAuth);

  user$: Observable<any> = user(this.auth);

  constructor() {}

  //Iniciar sesion con Google
  loginWithGoogle(): Promise<any>{
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  //Cerrar sesion
  logout(): Promise<any>{
    return signOut(this.auth);
  }

}
