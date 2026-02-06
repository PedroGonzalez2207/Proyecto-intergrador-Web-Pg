import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Auth } from '../../services/auth';
import { AsesoriasService } from '../../services/asesosrias';
import { AsesoriaDTO, AsesoriaEstado } from '../../models/asesoria';

type Estado = AsesoriaEstado;

interface AsesoriaItem extends AsesoriaDTO {
  mensajeRespuesta?: string;
  usuarioNombreUI?: string;
  fechaUI?: string;
  horaUI?: string;
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
  loading = false;
  errorMsg = '';

  modalOpen = false;
  asesoriaSeleccionada: AsesoriaItem | null = null;
  estadoDestino: Estado = 'Pendiente';
  mensajeRespuesta = '';

  ngOnInit(): void {
    this.auth.user$.subscribe((u: any) => {
      if (!u) {
        this.asesorias = [];
        this.loading = false;
        this.errorMsg = '';
        this.cdr.detectChanges();
        return;
      }
      this.cargarAsesorias();
    });
  }

  private nombreUsuario(a: any): string {
    const c = a?.cliente;
    const u = c?.usuario ?? c;
    const n = `${u?.nombres || ''} ${u?.apellidos || ''}`.trim();
    return n || u?.email || a?.usuarioNombre || 'Usuario';
  }

  private parseLocalDateTime(v: any): Date | null {
    if (!v) return null;

    if (typeof v === 'string') {
      const s = v.trim();
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d;
      return null;
    }

    if (Array.isArray(v) && v.length >= 5) {
      const [y, m, d, hh, mm] = v;
      return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0);
    }

    return null;
  }

  private fmtFecha(d: Date | null): string {
    if (!d) return '';
    return d.toLocaleDateString('es-EC', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  private fmtHora(d: Date | null): string {
    if (!d) return '';
    return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  }

  private cargarAsesorias(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.asesoriasService.getRecibidas().subscribe({
      next: (lista) => {
        this.asesorias = (lista || []).map((a: any) => {
          const ini = this.parseLocalDateTime(a?.fechaInicio);
          return {
            ...a,
            mensajeRespuesta: a?.mensajeRespuesta || a?.mensajeProgramador || '',
            usuarioNombreUI: this.nombreUsuario(a),
            fechaUI: this.fmtFecha(ini),
            horaUI: this.fmtHora(ini),
          };
        });
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.asesorias = [];
        this.loading = false;
        this.errorMsg = err?.error || 'No se pudieron cargar las asesorías recibidas.';
        this.cdr.detectChanges();
      },
    });
  }

  abrirDialogo(a: AsesoriaItem, estado: Estado) {
    this.asesoriaSeleccionada = a;
    this.estadoDestino = estado;

    if (estado === 'Aprobada') {
      this.mensajeRespuesta = 'Tu asesoría ha sido aprobada. Nos vemos en la fecha y hora acordadas.';
    } else if (estado === 'Rechazada') {
      this.mensajeRespuesta = 'En este momento no puedo atender la asesoría. Te invito a reagendar con otro horario o programador.';
    } else {
      this.mensajeRespuesta = 'Tu solicitud sigue en revisión. Te avisaré en cuanto pueda confirmar la asesoría.';
    }

    this.modalOpen = true;
    this.cdr.detectChanges();
  }

  cerrarModal() {
    this.modalOpen = false;
    this.asesoriaSeleccionada = null;
    this.mensajeRespuesta = '';
    this.cdr.detectChanges();
  }

  async guardarRespuesta() {
    if (!this.asesoriaSeleccionada?.id) return;

    const msg = this.mensajeRespuesta.trim();

    try {
      if (this.estadoDestino === 'Rechazada') {
        const ok = confirm('¿Seguro que deseas rechazar esta asesoría?');
        if (!ok) return;
      }

      if (this.estadoDestino === 'Aprobada') {
        await this.asesoriasService.aprobar(this.asesoriaSeleccionada.id, msg || undefined);
      } else if (this.estadoDestino === 'Rechazada') {
        await this.asesoriasService.rechazar(this.asesoriaSeleccionada.id, msg || undefined);
      } else {
        this.cerrarModal();
        this.cargarAsesorias();
        return;
      }

      this.cerrarModal();
      this.cargarAsesorias();
    } catch (e: any) {
      alert(e?.error || e?.message || 'No se pudo guardar la respuesta.');
      this.cdr.detectChanges();
    }
  }
}
