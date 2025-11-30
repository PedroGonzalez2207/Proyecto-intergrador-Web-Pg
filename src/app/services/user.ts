import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore'
import { Observable } from 'rxjs';
import { AppUser, Role } from '../models/app-user';

@Injectable({
  providedIn: 'root',
})

export class User {

  constructor(private firestore: Firestore){}  

  //Obetener usuarios para Admin
  getAllUsers(): Observable<AppUser[]> {
    const colRef = collection(this.firestore, 'users');
    return collectionData(colRef, {idField: 'uid'}) as Observable<AppUser[]>;
  }

  //Obtener usuario by ID
  async getUserByID(uid: string): Promise<AppUser | null>{
    const ref = doc(this.firestore, 'users', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as AppUser;
  }

  //Crear o Actualizar Usuario
  async saveUser(user: AppUser): Promise<void>{
    const ref = doc(this.firestore, 'users', user.uid);
    await setDoc(ref, user, {merge: true});
  }

  //Cambia rol
  async updateRol(uid: string, role: Role): Promise<void>{
    const ref = doc(this.firestore,'users',uid);
    await updateDoc(ref, {role});
  }

  //Actualizar datos de programador (especialidad, descripción, redes, etc.)
  async updateProgrammerProfile(uid: string, data: Partial<AppUser>): Promise<void>{
    const ref = doc(this.firestore, 'users', uid);
    await updateDoc(ref, data);
  }


}
