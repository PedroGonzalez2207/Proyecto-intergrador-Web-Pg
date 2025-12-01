import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from './services/auth';
import { AppUser } from './models/app-user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App implements OnInit {

  constructor(
    private auth: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {

    this.auth.user$.subscribe(async firebaseUser => {
      console.log('firebaseUser:', firebaseUser);

      // Si no hay usuario → Mantener en login
      if (!firebaseUser) {
        return;
      }

      // Crear / leer el usuario en Firestore
      const appUser: AppUser = await this.auth.ensureUserInBd(firebaseUser);
      console.log('appUser desde Firestore:', appUser);

      // Si por alguna razón no tiene rol definido → Usuario normal
      if (!appUser.role) {
        appUser.role = 'Usuario';
      }

      // Redirigir según rol
      this.auth.navigateByRole(appUser.role);
    });
  }
}
