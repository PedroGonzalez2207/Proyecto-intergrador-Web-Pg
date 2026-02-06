import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Observable } from 'rxjs';
import { AppUser, Role } from '../../models/app-user';
import { Auth } from '../../services/auth';
import { AdminUsuariosApiService } from '../../services/admin-usuarios-api';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss'],
})
export class AdminUsuarios implements OnInit {
  users$!: Observable<AppUser[]>;
  selectedUser: AppUser | null = null;

  especialidad = '';
  descripcion = '';
  fotoPerfil = '';
  github = '';
  linkedin = '';
  portfolio = '';
  twitter = '';

  nuevoNombre = '';
  nuevoEmail = '';

  constructor(
    private api: AdminUsuariosApiService,
    public auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.jwtReady$.subscribe((ready) => {
      if (!ready) return;
      this.cargar();
    });
  }

  private cargar() {
    this.users$ = this.api.list();
  }

  cambiarRol(user: AppUser, rol: Role) {
    if (!user?.email) return;
    if (user.role === rol) return;

    const fromRole = user.role;
    const ok = window.confirm(
      `¿Seguro que deseas cambiar el rol de ${user.displayName || user.email} de "${fromRole}" a "${rol}"?`
    );
    if (!ok) return;

    this.api.updateRoleByEmail(user.email, rol).subscribe({
      next: () => {
        console.log('[API][ROL] actualizado', user.email, rol);
        this.cargar();
      },
      error: (err) => console.error('Error al actualizar rol:', err),
    });
  }

  editarProgramador(user: AppUser) {
    this.selectedUser = user;

    this.especialidad = (user as any).especialidad || '';
    this.descripcion = (user as any).descripcion || '';
    this.fotoPerfil = (user as any).fotoPerfil || '';

    this.github = (user as any).redes?.github || '';
    this.linkedin = (user as any).redes?.linkedin || '';
    this.portfolio = (user as any).redes?.portfolio || '';
    this.twitter = (user as any).redes?.twitter || '';
  }

  cancelarEdicion() {
    this.selectedUser = null;
  }

  async guardarPerfilProgramador() {
    this.selectedUser = null;
  }

  crearProgramador() {
    alert('Para crear un usuario, debe iniciar sesión con Google al menos una vez.');
  }

  async logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
