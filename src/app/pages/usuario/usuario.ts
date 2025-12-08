import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { AsesoriasService } from '../../services/asesosrias';
import { AppUser, PortafolioUsuario } from '../../models/app-user';
import { Disponibilidad, Asesoria } from '../../models/asesoria';
import { firstValueFrom } from 'rxjs';

type Estado = 'pendiente' | 'aprobada' | 'rechazada';

interface PortafolioVisible {
  id: number | string;
  programadorId: string;
  programadorNombre: string;
  especialidad?: string;
  experiencia?: string;
  titulo: string;
  resumen?: string;
  tecnologias?: string;
}

interface ProgramadorItem {
  id: string;
  nombre: string;
  especialidad?: string;
  experiencia?: string;
  portafolios: PortafolioVisible[];
  redes?: any;
}

interface SolicitudAsesoria {
  id: number;
  programadorId: string;
  programadorNombre: string;
  fecha: string;
  hora: string;
  comentario: string;
  estado: Estado;
}

interface HoraOpcion {
  value: string;
  label: string;
}

type AsesoriaItem = Asesoria & { id: string };

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.scss'],
})
export class Usuario implements OnInit {
  public auth = inject(Auth);
  private userService = inject(User);
  private asesoriasService = inject(AsesoriasService);
  private cdr = inject(ChangeDetectorRef);

  isLoggedIn = false;

  programadores: ProgramadorItem[] = [];

  detalleSeleccionado: PortafolioVisible | null = null;
  seleccionado: PortafolioVisible | null = null;

  fecha = '';
  hora = '';
  comentario = '';

  solicitudes: SolicitudAsesoria[] = [];

  disponibilidades: Disponibilidad[] = [];
  horasDisponibles: HoraOpcion[] = [];

  misAsesorias: AsesoriaItem[] = [];

  totalAsesoriasRespondidas = 0;

  ngOnInit(): void {
    this.auth.user$.subscribe((u: any) => {
      if (u) {
        this.isLoggedIn = true;
        this.cargarProgramadoresConPortafolios();
        this.cargarMisAsesorias(u.uid);
      } else {
        this.isLoggedIn = false;
        this.programadores = [];
        this.detalleSeleccionado = null;
        this.seleccionado = null;
        this.disponibilidades = [];
        this.horasDisponibles = [];
        this.misAsesorias = [];
        this.totalAsesoriasRespondidas = 0;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarMisAsesorias(uid: string): void {
    this.asesoriasService
      .getAsesoriasByUsuario(uid)
      .subscribe((lista) => {
        this.misAsesorias = lista;

        this.totalAsesoriasRespondidas = lista.filter(
          (a) => a.estado === 'Aprobada' || a.estado === 'Rechazada'
        ).length;

        this.cdr.detectChanges();
      });
  }

  private leerPortafoliosLocal(uid: string): PortafolioUsuario[] {
    if (typeof window === 'undefined') return [];
    const storageKey = `proyectos_${uid}`;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as PortafolioUsuario[]) : [];
    } catch {
      return [];
    }
  }

  private cargarProgramadoresConPortafolios(): void {
    this.userService.getAllUsers().subscribe((usuarios: AppUser[]) => {
      const lista: ProgramadorItem[] = [];

      usuarios.forEach((u: any) => {
        const uid = u.uid || u.id;
        if (!uid) return;

        const firebasePortafolios: PortafolioUsuario[] = Array.isArray(
          (u as any).portafolios
        )
          ? ((u as any).portafolios as PortafolioUsuario[])
          : [];

        let basePortafolios: PortafolioUsuario[] = [];
        if (firebasePortafolios.length > 0) {
          basePortafolios = firebasePortafolios;
        } else {
          basePortafolios = this.leerPortafoliosLocal(uid);
        }

        if (!basePortafolios.length) return;

        const portafolios: PortafolioVisible[] = basePortafolios.map((p) => ({
          id: p.id,
          programadorId: uid,
          programadorNombre: u.displayName || u.email || 'Programador',
          especialidad: u.especialidad,
          experiencia: u.descripcion,
          titulo: p.nombre,
          resumen: p.descripcion,
          tecnologias: p.tecnologias,
        }));

        lista.push({
          id: uid,
          nombre: u.displayName || u.email || 'Programador',
          especialidad: u.especialidad,
          experiencia: u.descripcion,
          portafolios,
          redes: u.redes,
        });
      });

      this.programadores = lista;
      this.cdr.detectChanges();
    });
  }

  verDetalle(p: PortafolioVisible): void {
    if (!this.isLoggedIn) return;
    this.detalleSeleccionado = p;
  }

  seleccionarPortafolio(p: PortafolioVisible): void {
    if (!this.isLoggedIn) return;
    this.seleccionado = p;
    this.fecha = '';
    this.hora = '';
    this.comentario = '';
    this.disponibilidades = [];
    this.horasDisponibles = [];

    this.asesoriasService
      .getDisponibilidadByProgramador(p.programadorId)
      .subscribe((slots: Disponibilidad[]) => {
        this.disponibilidades = slots || [];
        this.actualizarHorasDisponibles();
        this.cdr.detectChanges();
      });
  }

  onFechaChange(): void {
    this.actualizarHorasDisponibles();
  }

  private actualizarHorasDisponibles(): void {
    if (!this.fecha) {
      this.horasDisponibles = [];
      this.hora = '';
      return;
    }

    const delDia = this.disponibilidades.filter((s) => s.fecha === this.fecha);

    if (!delDia.length) {
      this.horasDisponibles = [];
      this.hora = '';
      alert('El programador no tiene horarios disponibles para esta fecha.');
      return;
    }

    this.horasDisponibles = delDia
      .map((s) => ({
        value: s.horaInicio,
        label: `${s.horaInicio} — ${s.horaFin}`,
      }))
      .sort((a, b) => (a.value < b.value ? -1 : 1));

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

    try {
      await this.asesoriasService.crearSolicitud({
        usuarioUid: current.uid,
        usuarioEmail: current.email || current.displayName || '',
        programadorId: this.seleccionado.programadorId,
        programadorNombre: this.seleccionado.programadorNombre,
        fecha: this.fecha,
        hora: this.hora,
        comentario: this.comentario,
        estado: 'Pendiente',
        portafolioId: this.seleccionado.id,
        portafolioTitulo: this.seleccionado.titulo,
      });

      this.fecha = '';
      this.hora = '';
      this.comentario = '';
      this.horasDisponibles = [];
      this.cdr.detectChanges();

      alert('Solicitud de asesoría enviada correctamente.');
    } catch (e: any) {
      alert(e.message || 'No se pudo crear la asesoría.');
    }
  }

  logout() {
    this.auth.logout();
  }
}
