import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../../services/auth';
import { ProgramadoresApiService, ProyectoPublicDTO } from '../../services/programadores.api';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';

type Categoria = 'Academico' | 'Laboral';
type Participacion = 'Frontend' | 'Backend' | 'BaseDeDatos' | 'Fullstack';

interface ProyectoUI {
  id: number;
  categoria: Categoria;
  nombre: string;
  descripcion: string;
  participacion: Participacion;
  tecnologias: string;
  repoUrl: string;
  demoUrl: string;
}

interface Notificacion {
  id: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
}

@Component({
  selector: 'app-programador-portafolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './programador-portafolio.html',
  styleUrls: ['./programador-portafolio.scss'],
})
export class ProgramadorPortafolio implements OnInit {
  public auth = inject(Auth);
  private router = inject(Router);
  private programadoresApi = inject(ProgramadoresApiService);
  private http = inject(HttpClient);

  modalOpen = false;

  editando = false;
  proyectoEditandoId: number | null = null;

  proyectos: ProyectoUI[] = [];
  filtroCategoria: Categoria | 'Todos' = 'Todos';

  nuevo: Omit<ProyectoUI, 'id'> = {
    categoria: 'Academico',
    nombre: '',
    descripcion: '',
    participacion: 'Frontend',
    tecnologias: '',
    repoUrl: '',
    demoUrl: '',
  };

  notificaciones: Notificacion[] = [];
  private programadorId: number | null = null;

  ngOnInit(): void {
    this.auth.user$.subscribe(async (u: any) => {
      if (!u) {
        this.programadorId = null;
        this.proyectos = [];
        this.notificaciones = [];
        return;
      }

      const pid = await firstValueFrom(this.programadoresApi.me());
      this.programadorId = pid;

      await this.cargarProyectos(pid);
      this.cargarNotificaciones();
    });
  }

  private async cargarProyectos(programadorId: number): Promise<void> {
    const url = `${environment.apiBaseUrl}/proyectos/programador/${encodeURIComponent(String(programadorId))}`;
    const lista = await firstValueFrom(this.http.get<ProyectoPublicDTO[]>(url));

    this.proyectos = (lista || []).map((p) => ({
      id: p.id,
      categoria: p.categoria === 'Laboral' ? 'Laboral' : 'Academico',
      nombre: p.nombre,
      descripcion: p.descripcion,
      participacion: (p.participacion as any) || 'Frontend',
      tecnologias: p.tecnologias || '',
      repoUrl: p.repoUrl || '',
      demoUrl: p.demoUrl || '',
    }));
  }

  private cargarNotificaciones(): void {
    this.notificaciones = [];
  }

  cambiarFiltro(cat: Categoria | 'Todos') {
    this.filtroCategoria = cat;
  }

  obtenerProyectosFiltrados(): ProyectoUI[] {
    if (this.filtroCategoria === 'Todos') return this.proyectos;
    return this.proyectos.filter((p) => p.categoria === this.filtroCategoria);
  }

  abrirModal(proyecto?: ProyectoUI) {
    if (proyecto) {
      this.editando = true;
      this.proyectoEditandoId = proyecto.id;
      this.nuevo = {
        categoria: proyecto.categoria,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        participacion: proyecto.participacion,
        tecnologias: proyecto.tecnologias || '',
        repoUrl: proyecto.repoUrl || '',
        demoUrl: proyecto.demoUrl || '',
      };
    } else {
      this.editando = false;
      this.proyectoEditandoId = null;
      this.resetNuevo();
    }

    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
    this.editando = false;
    this.proyectoEditandoId = null;
    this.resetNuevo();
  }

  private resetNuevo(): void {
    this.nuevo = {
      categoria: 'Academico',
      nombre: '',
      descripcion: '',
      participacion: 'Frontend',
      tecnologias: '',
      repoUrl: '',
      demoUrl: '',
    };
  }

  async agregarProyecto() {
    if (!this.programadorId) return;
    if (!this.nuevo.nombre.trim() || !this.nuevo.descripcion.trim()) return;

    const body = {
      categoria: this.nuevo.categoria,
      nombre: this.nuevo.nombre,
      descripcion: this.nuevo.descripcion,
      participacion: this.nuevo.participacion,
      tecnologias: this.nuevo.tecnologias,
      repoUrl: this.nuevo.repoUrl,
      demoUrl: this.nuevo.demoUrl,
    };

    if (this.editando && this.proyectoEditandoId != null) {
      await firstValueFrom(this.http.put(`${environment.apiBaseUrl}/proyectos/${this.proyectoEditandoId}`, body));
    } else {
      await firstValueFrom(this.http.post(`${environment.apiBaseUrl}/proyectos/me`, body));
    }

    await this.cargarProyectos(this.programadorId);
    this.cerrarModal();
  }

  async eliminarProyecto(id: number) {
    if (!this.programadorId) return;
    await firstValueFrom(this.http.delete(`${environment.apiBaseUrl}/proyectos/${id}`));
    await this.cargarProyectos(this.programadorId);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
