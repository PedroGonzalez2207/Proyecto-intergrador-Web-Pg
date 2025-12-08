import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Observable, of, switchMap, firstValueFrom } from 'rxjs';

import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { AsesoriasService } from '../../services/asesosrias';
import { AppUser, PortafolioUsuario } from '../../models/app-user';

type Categoria = 'Academico' | 'Laboral';
type Participacion = 'Frontend' | 'Backend' | 'BaseDeDatos' | 'Fullstack';

type Proyecto = PortafolioUsuario;

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
  private userService = inject(User);
  private asesoriasService = inject(AsesoriasService);
  private cdr = inject(ChangeDetectorRef);

  programador$!: Observable<AppUser | null>;

  modalOpen = false;

  editando = false;
  proyectoEditandoId: number | null = null;

  proyectos: Proyecto[] = [];

  filtroCategoria: Categoria | 'Todos' = 'Todos';

  nuevo: Omit<Proyecto, 'id'> = {
    categoria: 'Academico',
    nombre: '',
    descripcion: '',
    participacion: 'Frontend',
    tecnologias: '',
    repoUrl: '',
    demoUrl: '',
  };

  notificaciones: Notificacion[] = [];

  private currentUid: string | null = null;

  ngOnInit(): void {
    this.programador$ = this.auth.user$.pipe(
      switchMap((u: any) => {
        if (!u || !u.uid) {
          return of(null);
        }
        return this.userService.getUserByUid(u.uid);
      })
    );

    this.auth.user$.subscribe((u: any) => {
      if (u && u.uid) {
        this.currentUid = u.uid;
        this.cargarProyectos();
        this.cargarNotificaciones();
      } else {
        this.currentUid = null;
        this.proyectos = [];
        this.notificaciones = [];
        this.cdr.detectChanges();
      }
    });
  }

  private getStorageKey(): string | null {
    if (!this.currentUid) return null;
    return `proyectos_${this.currentUid}`;
  }

  private leerProyectosLocal(): Proyecto[] {
    if (typeof window === 'undefined') return [];
    const key = this.getStorageKey();
    if (!key) return [];
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Proyecto[]) : [];
    } catch {
      return [];
    }
  }

  private guardarProyectosLocal(): void {
    if (typeof window === 'undefined') return;
    const key = this.getStorageKey();
    if (!key) return;
    window.localStorage.setItem(key, JSON.stringify(this.proyectos));
  }

  private async cargarProyectos(): Promise<void> {
    this.proyectos = [];
    const uid = this.currentUid;
    if (!uid) return;

    const usuario = await firstValueFrom(this.userService.getUserByUid(uid));

    const desdeFirebase: Proyecto[] =
      usuario && Array.isArray(usuario.portafolios)
        ? (usuario.portafolios as Proyecto[])
        : [];

    if (desdeFirebase.length) {
      this.proyectos = desdeFirebase;
      this.guardarProyectosLocal();
      this.cdr.detectChanges();
      return;
    }

    const desdeLocal = this.leerProyectosLocal();
    if (desdeLocal.length) {
      this.proyectos = desdeLocal;
      await this.userService.updateProgrammerProfile(uid, {
        portafolios: desdeLocal,
      });
      this.cdr.detectChanges();
    } else {
      this.cdr.detectChanges();
    }
  }

  private cargarNotificaciones(): void {
    const uid = this.currentUid;
    if (!uid) return;

    this.asesoriasService
      .getAsesoriasByProgramador(uid)
      .subscribe((lista) => {
        const pendientes = lista.filter((a) => a.estado === 'Pendiente');

        if (!pendientes.length) {
          this.notificaciones = [];
          this.cdr.detectChanges();
          return;
        }

        const ahora = new Date();
        this.notificaciones = [
          {
            id: 1,
            mensaje: 'Tienes asesorías pendientes por revisar.',
            fecha: ahora.toISOString().slice(0, 10),
            leida: false,
          },
        ];
        this.cdr.detectChanges();
      });
  }

  private async guardarProyectos(): Promise<void> {
    const uid = this.currentUid;
    if (!uid) return;
    this.guardarProyectosLocal();
    await this.userService.updateProgrammerProfile(uid, {
      portafolios: this.proyectos,
    });
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

  cambiarFiltro(cat: Categoria | 'Todos') {
    this.filtroCategoria = cat;
  }

  obtenerProyectosFiltrados(): Proyecto[] {
    if (this.filtroCategoria === 'Todos') {
      return this.proyectos;
    }
    return this.proyectos.filter((p) => p.categoria === this.filtroCategoria);
  }

  abrirModal(proyecto?: Proyecto) {
    if (proyecto) {
      // Modo edición
      this.editando = true;
      this.proyectoEditandoId = proyecto.id;
      this.nuevo = {
        categoria: proyecto.categoria,
        nombre: proyecto.nombre,
        descripcion: proyecto.descripcion,
        participacion: proyecto.participacion as Participacion,
        tecnologias: proyecto.tecnologias || '',
        repoUrl: proyecto.repoUrl || '',
        demoUrl: proyecto.demoUrl || '',
      };
    } else {
      // Modo nuevo
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

  agregarProyecto() {
    if (!this.nuevo.nombre.trim() || !this.nuevo.descripcion.trim()) return;

    if (this.editando && this.proyectoEditandoId !== null) {
      // Editar existente
      this.proyectos = this.proyectos.map((p) =>
        p.id === this.proyectoEditandoId
          ? {
              ...p,
              categoria: this.nuevo.categoria,
              nombre: this.nuevo.nombre,
              descripcion: this.nuevo.descripcion,
              participacion: this.nuevo.participacion,
              tecnologias: this.nuevo.tecnologias,
              repoUrl: this.nuevo.repoUrl,
              demoUrl: this.nuevo.demoUrl,
            }
          : p
      );
    } else {
      // Crear nuevo
      const id = this.proyectos.length
        ? Math.max(...this.proyectos.map((p) => p.id)) + 1
        : 1;

      this.proyectos.push({ id, ...this.nuevo });
    }

    this.guardarProyectos();
    this.cerrarModal();
  }

  eliminarProyecto(id: number) {
    this.proyectos = this.proyectos.filter((p) => p.id !== id);
    this.guardarProyectos();
  }

  marcarComoLeida(n: Notificacion) {
    n.leida = true;
  }

  limpiarNotificaciones() {
    this.notificaciones = [];
  }

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }
}
