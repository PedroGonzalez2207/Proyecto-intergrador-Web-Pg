import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Auth } from '../../services/auth';

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

@Component({
  selector: 'app-programador-portafolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './programador-portafolio.html',
  styleUrls: ['./programador-portafolio.scss'],
})
export class ProgramadorPortafolio {

  // Servicio Auth visible en el template
  public auth = inject(Auth);

  // Router para redirigir después de cerrar sesión
  private router = inject(Router);

  // Modal
  modalOpen = false;

  // Proyectos de ejemplo
  proyectos: Proyecto[] = [
    {
      id: 1,
      categoria: 'Academico',
      nombre: 'Sistema de Reservas',
      descripcion: 'App para gestionar reservas en tiempo real.',
      participacion: 'Backend',
      tecnologias: 'Node.js, Express, MongoDB',
      repoUrl: 'https://github.com/example/reservas'
    }
  ];

  nuevo: Proyecto = {
    id: 0,
    categoria: 'Academico',
    nombre: '',
    descripcion: '',
    participacion: 'Frontend',
    tecnologias: '',
    repoUrl: '',
    demoUrl: '',
  };

  // ---------- MODAL ----------
  abrirModal() {
    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
    this.nuevo = {
      id: 0,
      categoria: 'Academico',
      nombre: '',
      descripcion: '',
      participacion: 'Frontend',
      tecnologias: '',
      repoUrl: '',
      demoUrl: '',
    };
  }

  // ---------- CRUD PROYECTOS ----------
  agregarProyecto() {
    if (!this.nuevo.nombre || !this.nuevo.descripcion) return;

    const id = this.proyectos.length
      ? Math.max(...this.proyectos.map(p => p.id)) + 1
      : 1;

    this.proyectos.push({ ...this.nuevo, id });
    this.cerrarModal();
  }

  eliminarProyecto(id: number) {
    this.proyectos = this.proyectos.filter(p => p.id !== id);
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
