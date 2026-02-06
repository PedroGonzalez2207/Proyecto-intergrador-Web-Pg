import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosApiService } from '../../services/usuarios';
import { AppUser } from '../../models/app-user';

@Component({
  selector: 'app-test-backend',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Test Backend</h2>

    <button (click)="listar()">Listar usuarios (admin)</button>

    <p *ngIf="mensaje">{{ mensaje }}</p>

    <ul>
      <li *ngFor="let u of usuarios">
        {{ u.uid }} - {{ u.displayName }} - {{ u.email }} - {{ u.role }}
      </li>
    </ul>
  `
})
export class TestBackendComponent {
  usuarios: AppUser[] = [];
  mensaje = '';

  constructor(private usuariosService: UsuariosApiService) {}

  listar() {
    this.mensaje = 'Consultando...';
    this.usuariosService.listAdminUsers().subscribe({
      next: (data: AppUser[]) => {
        this.usuarios = data || [];
        this.mensaje = 'OK';
      },
      error: (err: unknown) => {
        const e = err as any;
        this.mensaje = 'Error: ' + (e?.message ?? JSON.stringify(e));
      }
    });
  }
}
