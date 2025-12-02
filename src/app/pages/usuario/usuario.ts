import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Estado = 'pendiente' | 'aprobada' | 'rechazada';

interface UsuarioPerfil {
  id: number | string;
  nombre: string;
  email: string;
  miembroDesde?: string;
}

interface PortafolioVisible {
  id: number | string;
  programadorId: number | string;
  programadorNombre: string;
  especialidad?: string;
  experiencia?: string;
  titulo: string;
  resumen?: string;
  tecnologias?: string;
}

interface SolicitudAsesoria {
  id: number;
  programadorId: number | string;
  programadorNombre: string;
  fecha: string;
  hora: string;
  comentario: string;
  estado: Estado;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario.html',
  styleUrls: ['./usuario.scss'],
})
export class Usuario implements OnInit {
  isLoggedIn = false;
  usuario: UsuarioPerfil | null = null;

  portafolios: PortafolioVisible[] = [];
  detalleSeleccionado: PortafolioVisible | null = null;
  seleccionado: PortafolioVisible | null = null;

  fecha = '';
  hora = '';
  comentario = '';

  solicitudes: SolicitudAsesoria[] = [];

  constructor() {}

  ngOnInit(): void {
    this.isLoggedIn = false;
    this.usuario = null;
    this.portafolios = [];
  }

  cargarPortafoliosDisponibles(): void {
    if (!this.isLoggedIn || !this.usuario) return;
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
  }

  enviarSolicitud(): void {
    if (!this.isLoggedIn || !this.usuario) return;
    if (!this.seleccionado) return;
    if (!this.fecha || !this.hora) return;

    const nueva: SolicitudAsesoria = {
      id: this.solicitudes.length + 1,
      programadorId: this.seleccionado.programadorId,
      programadorNombre: this.seleccionado.programadorNombre,
      fecha: this.fecha,
      hora: this.hora,
      comentario: this.comentario || '',
      estado: 'pendiente',
    };

    this.solicitudes.push(nueva);
    this.fecha = '';
    this.hora = '';
    this.comentario = '';
  }
}
