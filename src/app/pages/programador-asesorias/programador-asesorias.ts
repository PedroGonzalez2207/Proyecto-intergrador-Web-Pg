import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';
import { AsesoriasService } from '../../services/asesosrias';
import { Asesoria, AsesoriaEstado } from '../../models/asesoria';

type Estado = AsesoriaEstado;

interface AsesoriaItem extends Asesoria {
  id: string;
  mensajeRespuesta?: string;
}

@Component({
  selector: 'app-programador-asesorias',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './programador-asesorias.html',
  styleUrls: ['./programador-asesorias.scss'],
})
export class ProgramadorAsesorias implements OnInit {
  private auth = inject(Auth);
  private asesoriasService = inject(AsesoriasService);
  private cdr = inject(ChangeDetectorRef);

  asesorias: AsesoriaItem[] = [];

  modalOpen = false;
  asesoriaSeleccionada: AsesoriaItem | null = null;
  estadoDestino: Estado = 'Pendiente';
  mensajeRespuesta = '';

  ngOnInit(): void {
    this.auth.user$.subscribe((u: any) => {
      if (u && u.uid) {
        this.cargarAsesorias(u.uid);
      } else {
        this.asesorias = [];
        this.cdr.detectChanges();
      }
    });
  }

  private cargarAsesorias(programadorId: string): void {
    this.asesoriasService
      .getAsesoriasByProgramador(programadorId)
      .subscribe((lista) => {
        this.asesorias = lista.map((a) => ({
          ...a,
          mensajeRespuesta: (a as any).mensajeProgramador || '',
        }));
        this.cdr.detectChanges();
      });
  }

  abrirDialogo(a: AsesoriaItem, estado: Estado) {
    this.asesoriaSeleccionada = a;
    this.estadoDestino = estado;

    if (estado === 'Aprobada') {
      this.mensajeRespuesta =
        'Tu asesoría ha sido aprobada. Nos vemos en la fecha y hora acordadas.';
    } else if (estado === 'Rechazada') {
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

  async guardarRespuesta() {
    if (!this.asesoriaSeleccionada) return;

    if (this.estadoDestino === 'Rechazada') {
      const ok = confirm('¿Seguro que deseas rechazar esta asesoría?');
      if (!ok) return;
    }

    const mensaje = this.mensajeRespuesta.trim();
    await this.asesoriasService.updateAsesoriaEstado(
      this.asesoriaSeleccionada.id,
      this.estadoDestino,
      mensaje || undefined
    );

    this.asesoriaSeleccionada.estado = this.estadoDestino;
    this.asesoriaSeleccionada.mensajeRespuesta = mensaje;

    this.cerrarModal();
  }
}
