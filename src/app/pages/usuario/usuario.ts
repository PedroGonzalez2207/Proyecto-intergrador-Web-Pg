import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';
import { User } from '../../services/user';

type Estado = 'pendiente' | 'aprobada' | 'rechazada';

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

interface ProgramadorItem {
  id: number | string;
  nombre: string;
  especialidad?: string;
  experiencia?: string;
  portafolios: PortafolioVisible[];
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

  // Servicios
  public auth = inject(Auth);
  private userService = inject(User);

  isLoggedIn = false;

  programadores: ProgramadorItem[] = [];

  detalleSeleccionado: PortafolioVisible | null = null;
  seleccionado: PortafolioVisible | null = null;

  fecha = '';
  hora = '';
  comentario = '';

  solicitudes: SolicitudAsesoria[] = [];

  ngOnInit(): void {
    this.auth.user$.subscribe((u: any) => {
      console.log('USER EN USUARIO ===>', u);
      if (u) {
        this.isLoggedIn = true;

        this.cargarProgramadoresConPortafolios();
      } else {
        this.isLoggedIn = false;
        this.programadores = [];
        this.detalleSeleccionado = null;
        this.seleccionado = null;
      }
    });
  }

  cargarProgramadoresConPortafolios(): void {
    if (!this.isLoggedIn) return;

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
    if (!this.isLoggedIn) return;
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

  logout() {
    this.auth.logout();
  }

}
