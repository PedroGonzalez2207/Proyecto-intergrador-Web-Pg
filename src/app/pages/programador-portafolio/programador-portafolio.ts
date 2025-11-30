import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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

  // 🔥 Modal visible o no
  modalOpen = false;

  // Lista de proyectos
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

  // Modelo para un nuevo proyecto
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

  // Abrir modal
  abrirModal() {
    this.modalOpen = true;
  }

  // Cerrar modal
  cerrarModal() {
    this.modalOpen = false;

    // Limpiar el formulario
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

  // Agregar proyecto
  agregarProyecto() {
    if (!this.nuevo.nombre || !this.nuevo.descripcion) return;

    const id = this.proyectos.length
      ? Math.max(...this.proyectos.map(p => p.id)) + 1
      : 1;

    this.proyectos.push({ ...this.nuevo, id });

    this.cerrarModal();
  }

  // Eliminar
  eliminarProyecto(id: number) {
    this.proyectos = this.proyectos.filter(p => p.id !== id);
  }

}
