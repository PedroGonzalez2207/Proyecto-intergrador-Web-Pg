import { Injectable, inject } from '@angular/core';
import { Auth as FirebaseAuth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
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

  //Redirigir segun el rol
  private router: Router = inject(Router);

  private adminEmails: string[] = [
    'pedrojose.g2207@gmail.com',
  ];

  user$: Observable<any> = user(this.auth);

  constructor() {}

  //Iniciar sesion con Google
  async loginWithGoogle(): Promise<void>{
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    const firebaseUser = cred.user;
    
    //Asegurar que existe y rol asignado
    const appUser = await this.ensureUserInBd(firebaseUser);

    //Redirigir segun rol
    switch(appUser.role){
      case 'Admin':
        this.router.navigate(['/admin/usuarios']);
        break;
      case 'Programador':
        this.router.navigate(['/programador/portafolio']);
        break;
      case 'Usuario':
        this.router.navigate(['/usuario/portafolios']);
        break;
    }
  }

  //Asegurar que existe el usuario
  private async ensureUserInBd(firebaseUser: any): Promise<AppUser>{
    const uid = firebaseUser.uid;
    const email: string = firebaseUser.email || '';
    const displayName: string | null = firebaseUser.displayName;
    const photoURL: string | null = firebaseUser.photoURL;

    const ref = doc(this.firestore, 'users', uid);
    const snap = await getDoc(ref);

    if (snap.exists()){
      const existing = snap.data() as AppUser;

      const update: AppUser = {
        ... existing,
        email: email || existing.email,
        displayName,
        photoURL,
      };

      await setDoc(ref, update, {merge: true});
      return update;
    }

    let role: Role = 'Usuario';
    if (this.adminEmails.includes(email)){
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
  logout(): Promise<any>{
    return signOut(this.auth);
  }

}
