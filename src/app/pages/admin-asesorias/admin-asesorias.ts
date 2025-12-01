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

  auth = inject(Auth);
  private userService = inject(User);
  private asesoriasSrv = inject(AsesoriasService);
  private router = inject(Router);

  // Todos los usuarios (filtramos programadores en el template)
  programadores$!: Observable<AppUser[]>;

  // Programador seleccionado (objeto completo)
  selectedProgrammer: AppUser | null = null;

  // Disponibilidad del programador seleccionado
  disponibilidad$: Observable<Disponibilidad[]> = of<Disponibilidad[]>([]);

  // Formulario para nuevo horario
  fecha = '';
  horaInicio = '';
  horaFin = '';

  ngOnInit(): void {
    // Usamos tu getAllUsers existente
    this.programadores$ = this.userService.getAllUsers();
  }

  onProgramadorChange() {
    if (this.selectedProgrammer) {
      this.disponibilidad$ = this.asesoriasSrv.getDisponibilidadByProgramador(
        this.selectedProgrammer.uid
      );
    } else {
      this.disponibilidad$ = of<Disponibilidad[]>([]);
    }
  }

  async guardarDisponibilidad() {
    if (!this.selectedProgrammer) return;
    if (!this.fecha || !this.horaInicio || !this.horaFin) return;

    const prog = this.selectedProgrammer;

    const slot: Disponibilidad = {
      programadorId: prog.uid,
      programadorNombre: prog.displayName || prog.email || 'Programador',
      fecha: this.fecha,
      horaInicio: this.horaInicio,
      horaFin: this.horaFin,
    };

    await this.asesoriasSrv.addDisponibilidad(slot);

    // Limpia el formulario
    this.horaInicio = '';
    this.horaFin = '';
  }

  async eliminarSlot(id?: string) {
    if (!id) return;
    await this.asesoriasSrv.deleteDisponibilidad(id);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
