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

  //Servicio de Autenticación
  private authService = inject(Auth);

  //Metodo al usar al botón
  async onLoginWithGoogle(): Promise<void> {
    console.log('Click login con google (redirect)');
    await this.authService.loginWithGoogle();
  }
}
