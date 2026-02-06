import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { switchMap, startWith, map } from 'rxjs/operators';

import { Auth } from '../../services/auth';
import {
  ProgramadoresApiService,
  ProgramadorPublicDTO,
  DisponibilidadDTO,
  fmtFecha,
  fmtHora
} from '../../services/programadores.api';

import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-admin-asesorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-asesorias.html',
  styleUrls: ['./admin-asesorias.scss'],
})
export class AdminAsesorias implements OnInit {
  public auth = inject(Auth);
  private router = inject(Router);
  private programadoresApi = inject(ProgramadoresApiService);
  private reports = inject(ReportsService);

  programadores$: Observable<ProgramadorPublicDTO[]> = of([]);
  selectedProgrammer: ProgramadorPublicDTO | null = null;

  private refreshDisponibilidades$ = new Subject<void>();
  disponibilidad$: Observable<DisponibilidadDTO[]> = of([]);

  fecha = '';
  horaInicio = '';
  horaFin = '';
  modalidad: 'ONLINE' | 'PRESENCIAL' = 'ONLINE';

  pdfFrom = '';
  pdfTo = '';
  pdfLoading = false;

  ngOnInit(): void {
    this.auth.user$.subscribe((u: any) => {
      if (!u) {
        this.programadores$ = of([]);
        this.selectedProgrammer = null;
        this.disponibilidad$ = of([]);
        return;
      }
      this.programadores$ = this.programadoresApi.list();
    });
  }

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch {}
  }

  fmtFechaUI(v: any): string {
    const iso = this.toIsoFechaAny(v);
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  private toIsoFechaAny(v: any): string {
    if (!v) return '';

    if (typeof v === 'string') {
      const s = v.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

      const parts = s.split('/');
      if (parts.length === 3) {
        const a = parseInt(parts[0], 10);
        const b = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(y)) return s;

        const isDDMM = a > 12;
        const mm = isDDMM ? b : a;
        const dd = isDDMM ? a : b;

        return `${y}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
      }
      return s;
    }

    if (Array.isArray(v) && v.length >= 3) {
      const [y, m, d] = v;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    return '';
  }

  private toIsoDateInput(input: string): string {
    const s = String(input || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    const parts = s.split('/');
    if (parts.length === 3) {
      const a = parseInt(parts[0], 10);
      const b = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(y)) return s;

      const isDDMM = a > 12;
      const mm = isDDMM ? b : a;
      const dd = isDDMM ? a : b;

      return `${y}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }

    return s;
  }

  onProgramadorChange() {
    if (!this.selectedProgrammer) {
      this.disponibilidad$ = of([]);
      return;
    }

    const id = this.selectedProgrammer.id;

    this.disponibilidad$ = this.refreshDisponibilidades$.pipe(
      startWith(void 0),
      switchMap(() => this.programadoresApi.disponibilidades(id)),
      map(list =>
        (list || []).map(s => ({
          ...s,
          fecha: fmtFecha((s as any).fecha),
          horaInicio: fmtHora((s as any).horaInicio),
          horaFin: fmtHora((s as any).horaFin),
        }))
      )
    );
  }

  guardarDisponibilidad() {
    if (!this.selectedProgrammer || !this.fecha || !this.horaInicio || !this.horaFin || !this.modalidad) return;

    const body = {
      fecha: this.toIsoDateInput(this.fecha),
      horaInicio: String(this.horaInicio).slice(0, 5),
      horaFin: String(this.horaFin).slice(0, 5),
      modalidad: this.modalidad,
    };

    this.programadoresApi.crearDisponibilidad(this.selectedProgrammer.id, body).subscribe({
      next: () => {
        this.fecha = '';
        this.horaInicio = '';
        this.horaFin = '';
        this.refreshDisponibilidades$.next();
      },
    });
  }

  eliminarDisponibilidad(slot: DisponibilidadDTO) {
    if (!this.selectedProgrammer) return;
    if (!slot?.id) return;

    const ok = confirm('¿Seguro que deseas eliminar este horario?');
    if (!ok) return;

    this.programadoresApi.eliminarDisponibilidad(this.selectedProgrammer.id, slot.id).subscribe({
      next: () => this.refreshDisponibilidades$.next(),
    });
  }

  async descargarPdfAsesorias() {
    try {
      this.pdfLoading = true;
      const from = this.pdfFrom ? this.toIsoDateInput(this.pdfFrom) : undefined;
      const to = this.pdfTo ? this.toIsoDateInput(this.pdfTo) : undefined;

      const blob = await this.reports.asesoriaPdf(from, to);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_asesorias.pdf';
      a.click();

      window.URL.revokeObjectURL(url);
    } finally {
      this.pdfLoading = false;
    }
  }
}
