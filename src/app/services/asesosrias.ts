import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Disponibilidad } from '../models/asesoria';

@Injectable({ providedIn: 'root' })
export class AsesoriasService {

  private db = inject(Firestore);

  getDisponibilidadByProgramador(programadorId: string): Observable<Disponibilidad[]> {
    const ref = collection(this.db, 'disponibilidades');
    const q = query(ref, where('programadorId', '==', programadorId));
    return collectionData(q, { idField: 'id' }) as Observable<Disponibilidad[]>;
  }

  addDisponibilidad(slot: Disponibilidad) {
    const ref = collection(this.db, 'disponibilidades');
    return addDoc(ref, slot);
  }

  deleteDisponibilidad(id: string) {
    const ref = doc(this.db, 'disponibilidades', id);
    return deleteDoc(ref);
  }
}
