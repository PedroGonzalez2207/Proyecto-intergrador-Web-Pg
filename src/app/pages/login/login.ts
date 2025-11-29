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
  onLoginWithGoogle(): void{
    this.authService.loginWithGoogle().then((result: any) => {
      console.log('Usuario Logueado:', result.user);
    })
    .catch((error) =>{
      console.log('Error al iniciar sesion:', error);
    });
  }

}
