import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AppUser, Role } from '../models/app-user';

@Injectable({ providedIn: 'root' })
export class User {
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  // Obtener usuarios para Admin
  getAllUsers(): Observable<AppUser[]> {
    return runInInjectionContext(this.injector, () => {
      const colRef = collection(this.firestore, 'users');
      return collectionData(colRef, { idField: 'uid' }) as Observable<AppUser[]>;
    });
  }

  // Obtener usuario by ID
  async getUserByID(uid: string): Promise<AppUser | null> {
    return runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'users', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return null;
      return snap.data() as AppUser;
    });
  }

  // Crear o Actualizar Usuario
  async saveUser(user: AppUser): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'users', user.uid);
      await setDoc(ref, user, { merge: true });
    });
  }

  // Cambia rol
  async updateRol(uid: string, role: Role): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'users', uid);
      await updateDoc(ref, { role });
    });
  }

  // Actualizar datos de programador
  async updateProgrammerProfile(uid: string, data: Partial<AppUser>): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const ref = doc(this.firestore, 'users', uid);
      await updateDoc(ref, data);
    });
  }

  // Obtener un usuario por UID (para el perfil del programador)
  getUserByUid(uid: string): Observable<AppUser | null> {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, 'users', uid);
      return docData(ref, { idField: 'uid' }) as Observable<AppUser | null>;
    });
  }
}
