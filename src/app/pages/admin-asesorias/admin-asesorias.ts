import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Observable, of } from 'rxjs';

import { Auth } from '../../services/auth';
import { User } from '../../services/user';
import { AsesoriasService } from '../../services/asesosrias';

import { AppUser } from '../../models/app-user';
import { Disponibilidad } from '../../models/asesoria';

@Component({
  selector: 'app-admin-asesorias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-asesorias.html',
  styleUrls: ['./admin-asesorias.scss'],
})
export class AdminAsesorias implements OnInit {
  public auth = inject(Auth);
  private userService = inject(User);
  private asesoriasService = inject(AsesoriasService);
  private router = inject(Router);

  programadores$!: Observable<AppUser[]>;

  selectedProgrammer: AppUser | null = null;

  disponibilidad$: Observable<Disponibilidad[]> = of([]);

  fecha = '';
  horaInicio = '';
  horaFin = '';

  ngOnInit(): void {
    this.programadores$ = this.userService.getAllUsers();
  }

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err);
    }
  }

  onProgramadorChange() {
    if (this.selectedProgrammer) {
      this.disponibilidad$ =
        this.asesoriasService.getDisponibilidadByProgramador(
          this.selectedProgrammer.uid
        );
    } else {
      this.disponibilidad$ = of([]);
    }
  }

  async guardarDisponibilidad() {
    if (
      !this.selectedProgrammer ||
      !this.fecha ||
      !this.horaInicio ||
      !this.horaFin
    ) {
      return;
    }

    const slot: Disponibilidad = {
      programadorId: this.selectedProgrammer.uid,
      programadorNombre:
        this.selectedProgrammer.displayName ||
        this.selectedProgrammer.email,
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
    };

    try {
      const dup = await this.asesoriasService.isDuplicateSlot(
        slot.programadorId,
        slot.fecha,
        slot.horaInicio,
        slot.horaFin
      );

      if (dup) {
        alert('Este horario ya está registrado para este programador.');
        return;
      }

      await this.asesoriasService.addDisponibilidad(slot);

      console.log('[SIM-NOTIF][DISPONIBILIDAD-CREADA]', {
        programadorId: slot.programadorId,
        programadorNombre: slot.programadorNombre,
        fecha: slot.fecha,
        horaInicio: slot.horaInicio,
        horaFin: slot.horaFin,
        at: new Date().toISOString(),
      });

      this.fecha = '';
      this.horaInicio = '';
      this.horaFin = '';
      this.onProgramadorChange();
    } catch (err: any) {
      console.error('Error al guardar disponibilidad:', err);
    }
  }

  eliminarDisponibilidad(slot: Disponibilidad) {
    if (!slot.id) return;

    const ok = confirm('¿Seguro que deseas eliminar este horario?');
    if (!ok) return;

    this.asesoriasService
      .deleteDisponibilidad(slot.id)
      .then(() => {
        console.log('[SIM-NOTIF][DISPONIBILIDAD-ELIMINADA]', {
          id: slot.id,
          at: new Date().toISOString(),
        });
        this.onProgramadorChange();
      })
      .catch((err: any) => {
        console.error('Error al eliminar disponibilidad:', err);
      });
  }
}
