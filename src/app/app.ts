import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { Auth } from './services/auth';
import { AppUser } from './models/app-user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `<router-outlet />`,
  styleUrls: ['./app.scss']
})
export class App {

  private auth = inject(Auth);
  private router = inject(Router);

  constructor() {

    this.auth.user$.subscribe(async firebaseUser => {
      if (!firebaseUser) return;

      // Obtener usuario de Firestore
      const appUser: AppUser = await this.auth.ensureUserInBd(firebaseUser);

      // Navegar según el rol
      switch (appUser.role) {
        case 'Admin':
          this.router.navigate(['/admin/usuarios']);
          break;
        case 'Programador':
          this.router.navigate(['/programador/portafolio']);
          break;
        default:
          this.router.navigate(['/usuario/portafolios']);
          break;
      }
    });
  }
}
