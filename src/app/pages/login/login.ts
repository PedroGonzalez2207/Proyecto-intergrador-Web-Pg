import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  private authService = inject(Auth);

  async onLoginWithGoogle(): Promise<void> {
    try {
      console.log('Click login con google');
      await this.authService.loginWithGoogle();
    } catch (e) {
      console.error('Error en login con Google:', e);
    }
  }
}
