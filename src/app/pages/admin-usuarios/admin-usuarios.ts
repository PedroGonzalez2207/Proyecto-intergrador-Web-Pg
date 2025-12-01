import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Observable } from 'rxjs';
import { AppUser, Role } from '../../models/app-user';
import { User } from '../../services/user';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss'],
})
export class AdminUsuarios implements OnInit {

  users$!: Observable<AppUser[]>;

  // Usuario seleccionado para editar perfil
  selectedUser: AppUser | null = null;

  // Campos del formulario de programador
  especialidad = '';
  descripcion = '';
  fotoPerfil = '';
  github = '';
  linkedin = '';
  portfolio = '';
  twitter = '';

  constructor(
    private userService: User,
    public auth: Auth,   
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.users$ = this.userService.getAllUsers();
  }

  cambiarRol(user: AppUser, rol: Role) {
    this.userService.updateRol(user.uid, rol);
  }

  editarProgramador(user: AppUser) {
    this.selectedUser = user;

    this.especialidad = user.especialidad || '';
    this.descripcion = user.descripcion || '';
    this.fotoPerfil = user.fotoPerfil || '';

    this.github = user.redes?.github || '';
    this.linkedin = user.redes?.linkedin || '';
    this.portfolio = user.redes?.portfolio || '';
    this.twitter = user.redes?.twitter || '';
  }

  async guardarPerfilProgramador() {
    if (!this.selectedUser) return;

    await this.userService.updateProgrammerProfile(this.selectedUser.uid, {
      especialidad: this.especialidad,
      descripcion: this.descripcion,
      fotoPerfil: this.fotoPerfil,
      redes: {
        github: this.github,
        linkedin: this.linkedin,
        portfolio: this.portfolio,
        twitter: this.twitter,
      }
    });

    this.selectedUser = null;
  }

  cancelarEdicion() {
    this.selectedUser = null;
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
