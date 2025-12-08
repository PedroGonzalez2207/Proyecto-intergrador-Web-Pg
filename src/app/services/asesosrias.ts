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
  getDocs,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Disponibilidad, Asesoria, AsesoriaEstado } from '../models/asesoria';

@Injectable({ providedIn: 'root' })
export class AsesoriasService {
  private db = inject(Firestore);

  getDisponibilidadByProgramador(
    programadorId: string
  ): Observable<Disponibilidad[]> {
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

  async isDuplicateSlot(
    programadorId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ): Promise<boolean> {
    const ref = collection(this.db, 'disponibilidades');
    const q = query(
      ref,
      where('programadorId', '==', programadorId),
      where('fecha', '==', fecha)
    );
    const snap = await getDocs(q);

    const toMinutes = (h: string) => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm;
    };

    const nuevoIni = toMinutes(horaInicio);
    const nuevoFin = toMinutes(horaFin);

    for (const d of snap.docs) {
      const data = d.data() as Disponibilidad;
      const ini = toMinutes(data.horaInicio);
      const fin = toMinutes(data.horaFin);

      if (nuevoIni < fin && nuevoFin > ini) {
        return true;
      }
    }

    return false;
  }

  async existsAsesoriaBySlot(
    programadorId: string,
    fecha: string,
    hora: string
  ): Promise<boolean> {
    const ref = collection(this.db, 'asesorias');
    const q = query(
      ref,
      where('programadorId', '==', programadorId),
      where('fecha', '==', fecha),
      where('hora', '==', hora),
      where('estado', 'in', ['Pendiente', 'Aprobada'])
    );
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async createAsesoriaIfAvailable(a: Asesoria): Promise<void> {
    if (await this.existsAsesoriaBySlot(a.programadorId, a.fecha, a.hora)) {
      throw new Error('Ese horario ya está ocupado para ese programador.');
    }

    const ref = collection(this.db, 'asesorias');
    await addDoc(ref, a);
  }

  getDisponibilidadesProgramador(
    programadorId: string
  ): Observable<Disponibilidad[]> {
    return this.getDisponibilidadByProgramador(programadorId);
  }

  async crearSolicitud(input: {
    usuarioUid: string;
    usuarioEmail: string;
    programadorId: string;
    programadorNombre: string;
    fecha: string;
    hora: string;
    comentario?: string;
    estado: string;
    portafolioId?: number | string;
    portafolioTitulo?: string;
  }): Promise<void> {
    const asesoria: Asesoria = {
      programadorId: input.programadorId,
      programadorNombre: input.programadorNombre,
      usuarioId: input.usuarioUid,
      usuarioNombre: input.usuarioEmail,
      fecha: input.fecha,
      hora: input.hora,
      comentario: input.comentario,
      estado: 'Pendiente',
    };

    await this.createAsesoriaIfAvailable(asesoria);
  }

  getAsesoriasByProgramador(
    programadorId: string
  ): Observable<(Asesoria & { id: string })[]> {
    const ref = collection(this.db, 'asesorias');
    const q = query(ref, where('programadorId', '==', programadorId));
    return collectionData(q, { idField: 'id' }) as Observable<
      (Asesoria & { id: string })[]
    >;
  }

  getAsesoriasByUsuario(
    usuarioId: string
  ): Observable<(Asesoria & { id: string })[]> {
    const ref = collection(this.db, 'asesorias');
    const q = query(ref, where('usuarioId', '==', usuarioId));
    return collectionData(q, { idField: 'id' }) as Observable<
      (Asesoria & { id: string })[]
    >;
  }

  updateAsesoriaEstado(
    asesoriaId: string,
    estado: AsesoriaEstado,
    mensajeProgramador?: string
  ) {
    const ref = doc(this.db, 'asesorias', asesoriaId);
    const payload: any = { estado };
    if (mensajeProgramador !== undefined) {
      payload.mensajeProgramador = mensajeProgramador;
    }
    return updateDoc(ref, payload);
  }
}
  