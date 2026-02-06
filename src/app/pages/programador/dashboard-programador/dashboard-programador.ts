import { Component, OnInit, ChangeDetectorRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ProgramadoresApiService } from '../../../services/programadores.api';
import { MetricsService, ResumenDTO, SerieDTO } from '../../../services/metrics.service';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-dashboard-programador',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard-programador.html',
  styleUrl: './dashboard-programador.scss'
})
export class DashboardProgramadorComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private programadoresApi = inject(ProgramadoresApiService);

  programadorId: number | null = null;

  fromDate = this.firstDayOfMonth();
  toDate = this.today();

  loading = false;
  errorMsg = '';

  resumen: ResumenDTO = { total: 0, aprobadas: 0, rechazadas: 0, pendientes: 0 };

  donutData: ChartData<'doughnut', number[], string> = {
    labels: ['Aprobadas', 'Rechazadas', 'Pendientes'],
    datasets: [{ data: [0, 0, 0] }],
  };

  lineData: ChartData<'line', number[], string> = {
    labels: [],
    datasets: [{ data: [], label: 'Asesorías por día' }],
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: { legend: { display: true } },
  };

  constructor(private metrics: MetricsService, private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.initProgramador();
  }

  private async initProgramador() {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    try {
      const pid = await firstValueFrom(this.programadoresApi.me());
      this.programadorId = Number(pid);
      await this.cargar();
    } catch {
      this.errorMsg = 'No se pudo obtener el programador logueado.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async cargar() {
    if (!this.programadorId) return;

    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    try {
      const [res, serie] = await Promise.all([
        firstValueFrom(this.metrics.resumen(this.programadorId, this.fromDate, this.toDate)),
        firstValueFrom(this.metrics.serie(this.programadorId, this.fromDate, this.toDate)),
      ]);

      this.resumen = res;

      this.donutData = {
        labels: ['Aprobadas', 'Rechazadas', 'Pendientes'],
        datasets: [{ data: [res.aprobadas, res.rechazadas, res.pendientes] }],
      };

      this.lineData = {
        labels: (serie || []).map((x: SerieDTO) => x.dia),
        datasets: [{ data: (serie || []).map((x: SerieDTO) => x.total), label: 'Asesorías por día' }],
      };

      this.cdr.detectChanges();
      setTimeout(() => this.chart?.update(), 0);
    } catch {
      this.errorMsg = 'No se pudo cargar métricas';
      this.cdr.detectChanges();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private firstDayOfMonth(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }
}
