import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environments';
import { AsesoriaDTO, AsesoriaEstado } from '../models/asesoria';

type DateArray = [number, number, number];
type TimeArray = [number, number];
type DateTimeArray = [number, number, number, number, number, number?, number?];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function toIsoDateFromArray(a: any): string {
  if (!Array.isArray(a) || a.length < 3) return '';
  const [y, m, d] = a as DateArray;
  if (!y || !m || !d) return '';
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function timeFromTimeArray(a: any): string {
  if (!Array.isArray(a) || a.length < 2) return '';
  const [h, m] = a as TimeArray;
  if (h === undefined || m === undefined) return '';
  return `${pad2(h)}:${pad2(m)}`;
}

function timeFromDateTimeArray(a: any): string {
  if (!Array.isArray(a) || a.length < 5) return '';
  const h = a[3];
  const m = a[4];
  if (h === undefined || m === undefined) return '';
  return `${pad2(h)}:${pad2(m)}`;
}

function dateFromDateTimeArray(a: any): string {
  if (!Array.isArray(a) || a.length < 3) return '';
  return toIsoDateFromArray([a[0], a[1], a[2]]);
}

function toIsoDateFromString(s: any): string {
  const v = String(s || '').trim();
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);

  const parts = v.split('/');
  if (parts.length === 3) {
    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);
    const y = parseInt(parts[2], 10);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(y)) return v;

    const isDDMM = a > 12;
    const mm = isDDMM ? b : a;
    const dd = isDDMM ? a : b;
    return `${y}-${pad2(mm)}-${pad2(dd)}`;
  }

  return v;
}

function timeFromAny(v: any): string {
  if (!v) return '';
  if (typeof v === 'string') {
    const s = v.trim();
    if (/^\d{2}:\d{2}/.test(s)) return s.slice(0, 5);
    if (/T\d{2}:\d{2}/.test(s)) return s.slice(11, 16);
    return s;
  }
  if (Array.isArray(v)) {
    if (v.length === 2) return timeFromTimeArray(v);
    if (v.length >= 5) return timeFromDateTimeArray(v);
  }
  return '';
}

function toAmPm(hhmm: string): string {
  const s = String(hhmm || '').trim();
  if (!/^\d{2}:\d{2}$/.test(s)) return s;

  const hh = parseInt(s.slice(0, 2), 10);
  const mm = s.slice(3, 5);

  const isPM = hh >= 12;
  const h12 = hh % 12 === 0 ? 12 : hh % 12;

  return `${h12}:${mm} ${isPM ? 'PM' : 'AM'}`;
}

function timeFromAnyAmPm(v: any): string {
  const raw = timeFromAny(v);
  return raw ? toAmPm(raw) : '';
}

function timeFromDateTimeArrayAmPm(v: any): string {
  const raw = timeFromDateTimeArray(v);
  return raw ? toAmPm(raw) : '';
}

@Injectable({ providedIn: 'root' })
export class AsesoriasService {
  private base = `${environment.apiBaseUrl}/asesorias`;

  constructor(private http: HttpClient) {}

  private normalizeAsesoria(a: any): AsesoriaDTO {
    const fi = a?.fechaInicio;
    const ff = a?.fechaFin;

    const fecha =
      (typeof fi === 'string' ? toIsoDateFromString(fi) : toIsoDateFromArray(fi)) ||
      (Array.isArray(fi) ? dateFromDateTimeArray(fi) : '') ||
      toIsoDateFromString(a?.fecha);

    const hi =
      (typeof fi === 'string' ? toAmPm(String(fi).slice(11, 16)) : timeFromDateTimeArrayAmPm(fi)) ||
      timeFromAnyAmPm(a?.horaInicio) ||
      timeFromAnyAmPm(a?.hora);

    const hf =
      (typeof ff === 'string' ? toAmPm(String(ff).slice(11, 16)) : timeFromDateTimeArrayAmPm(ff)) ||
      timeFromAnyAmPm(a?.horaFin);

    const hora = hi && hf ? `${hi} — ${hf}` : (hi || hf || '');

    return {
      ...a,
      fecha,
      hora,
      programadorNombre:
        a?.programadorNombre ||
        a?.programador?.usuario?.nombres ||
        a?.programador?.usuario?.email ||
        a?.programador?.id?.toString?.() ||
        '',
      usuarioNombre:
        a?.usuarioNombre ||
        a?.cliente?.nombres ||
        a?.cliente?.email ||
        a?.cliente?.id?.toString?.() ||
        '',
      mensajeProgramador: a?.mensajeProgramador || a?.mensajeRespuesta || '',
    } as AsesoriaDTO;
  }

  getMisAsesorias(): Observable<AsesoriaDTO[]> {
    return this.http
      .get<any[]>(`${this.base}/mias`)
      .pipe(map((list) => (list || []).map((a) => this.normalizeAsesoria(a))));
  }

  getRecibidas(): Observable<AsesoriaDTO[]> {
    return this.http
      .get<any[]>(`${this.base}/recibidas`)
      .pipe(map((list) => (list || []).map((a) => this.normalizeAsesoria(a))));
  }

  aprobar(asesoriaId: number, mensaje?: string): Promise<void> {
    const id = encodeURIComponent(String(asesoriaId));
    const body: any = {};
    if (mensaje) body.mensaje = mensaje;
    return firstValueFrom(this.http.put<void>(`${this.base}/${id}/aprobar`, body));
  }

  rechazar(asesoriaId: number, mensaje?: string): Promise<void> {
    const id = encodeURIComponent(String(asesoriaId));
    const body: any = {};
    if (mensaje) body.mensaje = mensaje;
    return firstValueFrom(this.http.put<void>(`${this.base}/${id}/rechazar`, body));
  }

  getAsesoriasByUsuario(_usuarioUid: string): Observable<AsesoriaDTO[]> {
    return this.getMisAsesorias();
  }

  getAsesoriasByProgramador(_programadorId: number): Observable<AsesoriaDTO[]> {
    return this.getRecibidas();
  }

  crearSolicitud(_usuarioUid: string, _usuarioNombre: string, req: any): Promise<void> {
    const body = {
      programadorId: req.programadorId,
      fechaInicio: req.fechaInicio,
      fechaFin: req.fechaFin,
      modalidad: req.modalidad,
      comentario: req.comentario,
    };
    return firstValueFrom(this.http.post<void>(`${this.base}`, body));
  }

  updateAsesoriaEstado(asesoriaId: number, estado: AsesoriaEstado, mensajeProgramador?: string): Promise<void> {
    if (estado === 'Aprobada') return this.aprobar(asesoriaId, mensajeProgramador);
    if (estado === 'Rechazada') return this.rechazar(asesoriaId, mensajeProgramador);
    return Promise.resolve();
  }
}
