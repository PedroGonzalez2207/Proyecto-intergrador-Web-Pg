import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Estado = 'pendiente' | 'aprobada' | 'rechazada';

interface Asesoria {
  id: number;
  usuarioNombre: string;
  fecha: string;
  hora: string;
  comentario?: string;
  estado: Estado;
  mensajeRespuesta?: string;
}

@Component({
  selector: 'app-programador-asesorias',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './programador-asesorias.html',
  styleUrls: ['./programador-asesorias.scss'],
})
export class ProgramadorAsesorias {

  modalOpen = false;
  asesoriaSeleccionada: Asesoria | null = null;

  asesorias: Asesoria[] = [
    {
      id: 1,
      usuarioNombre: 'Juan Pérez',
      fecha: '2025-12-01',
      hora: '15:00',
      comentario: 'Necesito ayuda con Angular.',
      estado: 'pendiente'
    },
    {
      id: 2,
      usuarioNombre: 'María López',
      fecha: '2025-12-02',
      hora: '10:30',
      comentario: 'Consulta sobre bases de datos.',
      estado: 'aprobada',
      mensajeRespuesta: 'Revisamos tu modelo mañana.'
    }
  ];

  abrirModal(a: Asesoria) {
    this.modalOpen = true;
    this.asesoriaSeleccionada = { ...a };
  }

  cerrarModal() {
    this.modalOpen = false;
    this.asesoriaSeleccionada = null;
  }

  cambiarEstado(a: Asesoria, estado: Estado) {
    a.estado = estado;
  }
}
