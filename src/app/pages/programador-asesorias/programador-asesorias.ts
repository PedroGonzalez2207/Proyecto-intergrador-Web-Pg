import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './programador-asesorias.html',
  styleUrls: ['./programador-asesorias.scss'],
})
export class ProgramadorAsesorias {
  asesorias: Asesoria[] = [];

  //Modal
  modalOpen = false;
  asesoriaSeleccionada: Asesoria | null = null;
  estadoDestino: Estado = 'pendiente';
  mensajeRespuesta = '';
  abrirDialogo(a: Asesoria, estado: Estado) {
    this.asesoriaSeleccionada = a;
    this.estadoDestino = estado;

    // Mensaje estado
    if (estado === 'aprobada') {
      this.mensajeRespuesta =
        'Tu asesoría ha sido aprobada. Nos vemos en la fecha y hora acordadas.';
    } else if (estado === 'rechazada') {
      this.mensajeRespuesta =
        'En este momento no puedo atender la asesoría. Te invito a reagendar con otro horario o programador.';
    } else {
      this.mensajeRespuesta =
        'Tu solicitud sigue en revisión. Te avisaré en cuanto pueda confirmar la asesoría.';
    }

    this.modalOpen = true;
  }

  cerrarModal() {
    this.modalOpen = false;
    this.asesoriaSeleccionada = null;
    this.mensajeRespuesta = '';
  }

  guardarRespuesta() {
    if (!this.asesoriaSeleccionada) return;

    this.asesoriaSeleccionada.estado = this.estadoDestino;
    this.asesoriaSeleccionada.mensajeRespuesta = this.mensajeRespuesta.trim();

    this.cerrarModal();
  }
}
