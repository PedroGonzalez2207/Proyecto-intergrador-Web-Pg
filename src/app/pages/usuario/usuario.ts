import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../../services/auth';
import { AsesoriasService } from '../../services/asesosrias';
import {
  ProgramadoresApiService,
  ProgramadorPublicDTO,
  DisponibilidadDTO,
  ProyectoPublicDTO,
  fmtFecha,
  fmtHora
} from '../../services/programadores.api';
import { AsesoriaDTO } from '../../models/asesoria';
import { environment } from '../../../environments/environments';

interface PortafolioVisible {
  id: number | string;
  programadorId: number;
  programadorNombre: string;
  especialidad?: string;
  experiencia?: string;
  titulo: string;
  resumen?: string;
  tecnologias?: string;
  repoUrl?: string;
  demoUrl?: string;
}

interface ProgramadorItem {
  id: number;
  nombre: string;
  bio?: string | null;
  especialidades?: string | null;
  portafolios: PortafolioVisible[];
}

interface HoraOpcion {
  value: string;
  label: string;
  inicio: string;
  fin: string;
  modalidad?: string | null;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.scss'],
})
export class Usuario implements OnInit {
  public auth = inject(Auth);
  private asesoriasService = inject(AsesoriasService);
  private programadoresApi = inject(ProgramadoresApiService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  isLoggedIn = false;

  programadores: ProgramadorItem[] = [];

  detalleSeleccionado: PortafolioVisible | null = null;
  seleccionado: PortafolioVisible | null = null;

  mostrarModalDetalle = false;
  mostrarModalAgendar = false;

  fecha = '';
  hora = '';
  comentario = '';

  disponibilidades: DisponibilidadDTO[] = [];
  horasDisponibles: HoraOpcion[] = [];

  misAsesorias: AsesoriaDTO[] = [];
  totalAsesoriasRespondidas = 0;

  ngOnInit(): void {
    this.auth.user$.subscribe(async (u: any) => {
      if (u) {
        this.isLoggedIn = true;
        await this.cargarProgramadoresConProyectos();
        this.cargarMisAsesorias(u.uid);
      } else {
        this.resetVista();
      }
    });
  }

  private resetVista() {
    this.isLoggedIn = false;
    this.programadores = [];
    this.detalleSeleccionado = null;
    this.seleccionado = null;
    this.disponibilidades = [];
    this.horasDisponibles = [];
    this.misAsesorias = [];
    this.totalAsesoriasRespondidas = 0;
    this.mostrarModalDetalle = false;
    this.mostrarModalAgendar = false;
    this.cdr.detectChanges();
  }

  private cargarMisAsesorias(uid: string): void {
    this.asesoriasService.getAsesoriasByUsuario(uid).subscribe((lista) => {
      const arr = lista || [];
      this.misAsesorias = arr;
      this.totalAsesoriasRespondidas = arr.filter(
        (a) => a.estado === 'Aprobada' || a.estado === 'Rechazada'
      ).length;
      this.cdr.detectChanges();
    });
  }

  private async cargarProgramadoresConProyectos(): Promise<void> {
    const programadores = await firstValueFrom(this.programadoresApi.list());
    const lista: ProgramadorItem[] = [];

    for (const p of (programadores || []) as ProgramadorPublicDTO[]) {
      const proyectos = await this.fetchProyectosPorProgramador(p.id);

      const portafolios: PortafolioVisible[] = (proyectos || []).map((pr: ProyectoPublicDTO) => ({
        id: pr.id,
        programadorId: p.id,
        programadorNombre: p.nombre,
        especialidad: (p as any).especialidades || undefined,
        experiencia: (p as any).bio || undefined,
        titulo: pr.nombre,
        resumen: pr.descripcion,
        tecnologias: pr.tecnologias || undefined,
        repoUrl: pr.repoUrl || undefined,
        demoUrl: pr.demoUrl || undefined,
      }));

      lista.push({
        id: p.id,
        nombre: p.nombre,
        bio: (p as any).bio,
        especialidades: (p as any).especialidades,
        portafolios,
      });
    }

    this.programadores = lista;
    this.cdr.detectChanges();
  }

  private async fetchProyectosPorProgramador(programadorId: number): Promise<ProyectoPublicDTO[]> {
    const url = `${environment.apiBaseUrl}/proyectos/programador/${encodeURIComponent(String(programadorId))}`;
    return (await firstValueFrom(this.http.get<ProyectoPublicDTO[]>(url))) || [];
  }

  verDetalle(p: PortafolioVisible): void {
    if (!this.isLoggedIn) return;
    this.detalleSeleccionado = p;
    this.mostrarModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.detalleSeleccionado = null;
  }

  agendarGenerico(prog: ProgramadorItem): void {
    this.seleccionarPortafolio({
      id: 'N/A',
      programadorId: prog.id,
      programadorNombre: prog.nombre,
      especialidad: prog.especialidades || undefined,
      experiencia: prog.bio || undefined,
      titulo: 'Asesoría',
      resumen: '',
      tecnologias: '',
      repoUrl: '',
      demoUrl: ''
    });
  }

  seleccionarPortafolio(p: PortafolioVisible): void {
    if (!this.isLoggedIn) return;

    this.seleccionado = p;
    this.fecha = '';
    this.hora = '';
    this.comentario = '';
    this.disponibilidades = [];
    this.horasDisponibles = [];
    this.mostrarModalAgendar = true;

    this.programadoresApi.disponibilidades(p.programadorId).subscribe((slots) => {
      this.disponibilidades = (slots || []).map(s => ({
        ...s,
        fecha: fmtFecha(s.fecha as any),
        horaInicio: fmtHora(s.horaInicio as any),
        horaFin: fmtHora(s.horaFin as any),
      }));
      this.actualizarHorasDisponibles();
      this.cdr.detectChanges();
    });
  }

  cerrarModalAgendar(): void {
    this.mostrarModalAgendar = false;
    this.seleccionado = null;
    this.fecha = '';
    this.hora = '';
    this.comentario = '';
    this.horasDisponibles = [];
  }

  onFechaChange(): void {
    this.actualizarHorasDisponibles();
  }

  nombreProgramadorEnAsesoria(a: any): string {
    const p = a?.programador;
    const u = p?.usuario;
    const n = `${u?.nombres || ''} ${u?.apellidos || ''}`.trim();
    return n || u?.email || a?.programadorNombre || '-';
  }



  private toIsoDate(input: string): string {
    const s = String(input || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const parts = s.split('/');
    if (parts.length === 3) {
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(y)) return s;

      const isDDMM = a > 12;
      const mm = isDDMM ? b : a;
      const dd = isDDMM ? a : b;

      return `${y}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }

    return s;
  }

  private actualizarHorasDisponibles(): void {
    const iso = this.toIsoDate(this.fecha);

    if (!iso) {
      this.horasDisponibles = [];
      this.hora = '';
      return;
    }

    const delDia = (this.disponibilidades || []).filter((s) => String(s.fecha) === iso);

    if (!delDia.length) {
      this.horasDisponibles = [];
      this.hora = '';
      alert('El programador no tiene horarios disponibles para esta fecha.');
      return;
    }

    this.horasDisponibles = delDia
      .map((s) => {
        const inicio = String(s.horaInicio);
        const fin = String(s.horaFin);
        const value = `${inicio}|${fin}|${String(s.modalidad || '')}`;
        return {
          value,
          label: `${inicio} — ${fin}`,
          inicio,
          fin,
          modalidad: s.modalidad || null
        };
      })
      .sort((a, b) => (a.inicio < b.inicio ? -1 : 1));

    if (!this.horasDisponibles.some((h) => h.value === this.hora)) {
      this.hora = '';
    }
  }

  async enviarSolicitud(): Promise<void> {
    if (!this.isLoggedIn) return;
    if (!this.seleccionado) return;
    if (!this.fecha || !this.hora) return;

    const current = await firstValueFrom(this.auth.user$);
    if (!current) return;

    const iso = this.toIsoDate(this.fecha);
    const [inicio, fin, modRaw] = String(this.hora).split('|');
    const modalidad = (modRaw || '').trim() || 'PRESENCIAL';

    const fechaInicio = `${iso}T${String(inicio).slice(0, 5)}`;
    const fechaFin = `${iso}T${String(fin).slice(0, 5)}`;

    try {
      await this.asesoriasService.crearSolicitud(
        current.uid,
        current.email || current.displayName || '',
        {
          programadorId: this.seleccionado.programadorId,
          programadorNombre: this.seleccionado.programadorNombre,
          fechaInicio,
          fechaFin,
          modalidad,
          comentario: this.comentario,
          portafolioId: this.seleccionado.id,
          portafolioTitulo: this.seleccionado.titulo,
        } as any
      );

      this.cerrarModalAgendar();
      this.cargarMisAsesorias(current.uid);
      this.cdr.detectChanges();
      alert('Solicitud de asesoría enviada correctamente.');
    } catch (e: any) {
      alert(e?.message || 'No se pudo crear la asesoría.');
    }
  }

  logout() {
    this.auth.logout();
  }
}
