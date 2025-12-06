import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Observable, of, switchMap } from 'rxjs';

import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { AppUser } from '../../models/app-user';

type Categoria = 'Academico' | 'Laboral';
type Participacion = 'Frontend' | 'Backend' | 'BaseDeDatos' | 'Fullstack';

interface Proyecto {
  id: number;
  categoria: Categoria;
  nombre: string;
  descripcion: string;
  participacion: Participacion;
  tecnologias: string;
  repoUrl?: string;
  demoUrl?: string;
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
  private userService = inject(User);

  programador$!: Observable<AppUser | null>;

  modalOpen = false;

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

  ngOnInit(): void {
    this.programador$ = this.auth.user$.pipe(
      switchMap((u: any) => {
        if (!u || !u.uid) {
          return of(null);
        }

        return this.userService.getUserByUid(u.uid);
      })
    );

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

  abrirModal() {
    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
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

  //Proyeto
  agregarProyecto() {
    if (!this.nuevo.nombre.trim() || !this.nuevo.descripcion.trim()) return;

    const id = this.proyectos.length
      ? Math.max(...this.proyectos.map((p) => p.id)) + 1
      : 1;

    this.proyectos.push({ id, ...this.nuevo });
    this.cerrarModal();
  }

  eliminarProyecto(id: number) {
    this.proyectos = this.proyectos.filter((p) => p.id !== id);
  }

  //Notificaciones
  marcarComoLeida(n: Notificacion) {
    n.leida = true;
  }

  limpiarNotificaciones() {
    this.notificaciones = [];
  }

  //LOGOUT
  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  }
}
